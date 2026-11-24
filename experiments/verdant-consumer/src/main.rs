//! Experimental standalone consumer of released Verdant v2.21.7 crates.
//! Not linked into Pixel Pals runtime or into the canonical World save schema.
#![forbid(unsafe_code)]

use std::{collections::{BTreeMap, BTreeSet, VecDeque}, env, fs, path::Path};

use serde::Deserialize;
use verdant_core::{
    ecs::{EntityRole, SceneWorld, Transform},
    geometry::{generate_terrain_patch_mesh, ProceduralMesh},
    gltf_io::{export_scene_to_glb, validate_glb_bytes},
    hd_world::{
        generate_parabolic_arch_bridge_mesh, generate_sculpted_canopy_tree_mesh,
        generate_studio_primitive_mesh, AuthorPrimitiveKind,
    },
    math::{Quat, Vec3},
    render::PbrMaterial,
};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Region {
    schema_version: u32,
    region_id: String,
    seed: u64,
    half_extent_meters: f64,
    landmarks: Vec<Point>,
    paths: Vec<[String; 2]>,
    bridge: Bridge,
    trees: Vec<Point>,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Point {
    id: String,
    x: f64,
    z: f64,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Bridge {
    id: String,
    x: f64,
    z: f64,
    span_meters: f64,
}

fn valid_id(s: &str) -> bool {
    s.len() <= 64 && !s.is_empty() && s.as_bytes().iter().enumerate().all(|(i, c)| {
        if i == 0 { c.is_ascii_lowercase() }
        else { c.is_ascii_lowercase() || c.is_ascii_digit() || *c == b'-' }
    })
}

fn validate(recipe: &Region) -> Result<(), String> {
    if recipe.schema_version != 1 || !valid_id(&recipe.region_id) || recipe.seed == 0 {
        return Err("invalid recipe version, id or seed".into());
    }
    let half = recipe.half_extent_meters;
    if !half.is_finite() || !(10.0..=40.0).contains(&half) {
        return Err("terrain half extent must be 10..40 meters".into());
    }
    if !(3..=10).contains(&recipe.landmarks.len()) ||
       !(1..=12).contains(&recipe.trees.len()) || !(2..=18).contains(&recipe.paths.len()) {
        return Err("unbounded landmark, tree or path count".into());
    }
    if !valid_id(&recipe.bridge.id) || !recipe.bridge.span_meters.is_finite() ||
       !(4.0..=12.0).contains(&recipe.bridge.span_meters) {
        return Err("invalid bridge".into());
    }
    let mut ids = BTreeSet::new();
    ids.insert(recipe.bridge.id.clone());
    for p in recipe.landmarks.iter().chain(&recipe.trees) {
        if !valid_id(&p.id) || !ids.insert(p.id.clone()) {
            return Err("invalid or duplicate landmark/tree id".into());
        }
    }
    for p in recipe.landmarks.iter().chain(&recipe.trees) {
        if !p.x.is_finite() || !p.z.is_finite() || p.x.abs() > half - 1.0 || p.z.abs() > half - 1.0 {
            return Err("point outside allowed terrain bounds".into());
        }
    }
    if !recipe.bridge.x.is_finite() || !recipe.bridge.z.is_finite() ||
       recipe.bridge.x.abs() > half - 6.0 || recipe.bridge.z.abs() > half - 6.0 {
        return Err("bridge outside allowed terrain bounds".into());
    }
    let places: BTreeMap<&str, &Point> = recipe.landmarks.iter().map(|p| (p.id.as_str(), p)).collect();
    if !places.contains_key("home") { return Err("no safe home landmark".into()); }
    let mut edges: BTreeMap<&str, Vec<&str>> = BTreeMap::new();
    let mut used_edges = BTreeSet::new();
    for path in &recipe.paths {
        let a = path[0].as_str();
        let b = path[1].as_str();
        if a == b || !places.contains_key(a) || !places.contains_key(b) {
            return Err(format!("unknown or degenerate path: {a} -> {b}"));
        }
        let key = if a < b { (a,b) } else { (b,a) };
        if !used_edges.insert(key) { return Err("duplicate path".into()); }
        edges.entry(a).or_default().push(b);
        edges.entry(b).or_default().push(a);
    }
    let mut visited = BTreeSet::from(["home"]);
    let mut queue = VecDeque::from(["home"]);
    while let Some(a) = queue.pop_front() {
        for &b in edges.get(a).map(|v| v.as_slice()).unwrap_or(&[]) {
            if visited.insert(b) { queue.push_back(b); }
        }
    }
    if visited.len() != recipe.landmarks.len() {
        return Err("disconnected or unreachable safe-home path".into());
    }
    Ok(())
}

fn material(name: &str, rgba: [f32;4]) -> PbrMaterial {
    PbrMaterial {
        name: name.to_string(),
        base_color_factor: rgba,
        metallic_factor: 0.0,
        roughness_factor: 0.92,
        emissive_factor: [0.0,0.0,0.0],
        ior: 1.5,
        double_sided: false,
    }
}

#[allow(clippy::too_many_arguments)]
fn append(
    scene: &mut SceneWorld, meshes: &mut Vec<ProceduralMesh>,
    name: &str, role: EntityRole, mesh: ProceduralMesh,
    material_index: usize, x: f64, y: f64, z: f64, yaw: f64,
) -> Result<(), String> {
    mesh.validate().map_err(|e| format!("{name}: invalid mesh: {e}"))?;
    let mesh_index = meshes.len();
    let mut transform = Transform::from_xyz(x,y,z);
    if yaw != 0.0 { transform.rotation = Quat::from_axis_angle(Vec3::UP, yaw); }
    let entity = scene.spawn(
        name.to_string(), role, None, transform, mesh.bounds(),
        (1.0,"pixel-pals-verdant-v2217-experiment"),
    );
    scene.attach_renderable(entity, mesh_index, material_index);
    meshes.push(mesh);
    Ok(())
}

fn export(recipe: &Region) -> Result<(Vec<u8>, usize, usize), String> {
    validate(recipe)?;
    let mut scene = SceneWorld::new();
    let mut meshes = Vec::new();
    let materials = [
        material("ground", [0.68,0.83,0.64,1.0]),
        material("canopy", [0.79,0.91,0.71,1.0]),
        material("stone", [0.78,0.73,0.68,1.0]),
        material("walkway", [0.82,0.75,0.62,1.0]),
        material("water", [0.35,0.65,0.79,1.0]),
    ];
    append(&mut scene,&mut meshes,"orchard-ground",EntityRole::TerrainPatch,
        generate_terrain_patch_mesh(recipe.seed,recipe.half_extent_meters,16),
        0, 0.0,0.0,0.0,0.0)?;
    for p in &recipe.trees {
        append(&mut scene,&mut meshes,&p.id,EntityRole::SurfaceFoliage,
            generate_sculpted_canopy_tree_mesh(0), 1, p.x,0.0,p.z,0.0)?;
    }
    append(&mut scene,&mut meshes,&recipe.bridge.id,EntityRole::StaticArchitecture,
        generate_parabolic_arch_bridge_mesh(Vec3::ZERO,recipe.bridge.span_meters,0),
        2,recipe.bridge.x,0.0,recipe.bridge.z,0.0)?;
    for (idx, endpoints) in recipe.paths.iter().enumerate() {
        let from = recipe.landmarks.iter().find(|p| p.id == endpoints[0]).ok_or("path origin not found")?;
        let to = recipe.landmarks.iter().find(|p| p.id == endpoints[1]).ok_or("path destination not found")?;
        let dx = to.x-from.x;
        let dz = to.z-from.z;
        let length = dx.hypot(dz);
        if length < 0.1 { return Err("zero-length walk".into()); }
        let mesh = generate_studio_primitive_mesh(AuthorPrimitiveKind::Platform, length/2.0,0.05,0.3,[0.73,0.64,0.46,1.0]);
        append(&mut scene,&mut meshes,&format!("path-{idx}"),EntityRole::StaticArchitecture,
            mesh,3,(from.x+to.x)/2.0,0.02,(from.z+to.z)/2.0,-dz.atan2(dx))?;
    }
    let water = generate_studio_primitive_mesh(AuthorPrimitiveKind::Platform,1.1,0.02,7.0,[0.30,0.60,0.80,1.0]);
    append(&mut scene,&mut meshes,"orchard-stream",EntityRole::FluidVolume,
        water,4,recipe.bridge.x,-0.40,recipe.bridge.z,0.0)?;

    let count = meshes.len();
    let triangles = meshes.iter().map(|m| m.triangle_count()).sum();
    let glb = export_scene_to_glb(&scene,&meshes,&materials)
        .map_err(|e|format!("Verdant GLB export failed: {e}"))?;
    validate_glb_bytes(&glb).map_err(|e|format!("Verdant GLB validation failed: {e}"))?;
    Ok((glb,count,triangles))
}

fn run() -> Result<(), String> {
    let mut args = env::args_os().skip(1);
    let input = args.next().ok_or("usage: pixel-pals-verdant-consumer <recipe.json> <output.glb>")?;
    let output = args.next().ok_or("missing output.glb path")?;
    if args.next().is_some() { return Err("unexpected third argument".into()); }
    let input = Path::new(&input);
    let output = Path::new(&output);
    let bytes = fs::read(input).map_err(|e|format!("read recipe: {e}"))?;
    let recipe: Region = serde_json::from_slice(&bytes).map_err(|e|format!("parse recipe: {e}"))?;
    let (glb,mesh_count,triangles) = export(&recipe)?;
    fs::write(output,&glb).map_err(|e|format!("write GLB: {e}"))?;
    println!("EXPORTED: recipe={} seed={} meshes={} triangles={} bytes={} output={}",
        recipe.region_id,recipe.seed,mesh_count,triangles,glb.len(),output.display());
    Ok(())
}

fn main() {
    if let Err(error) = run() {
        eprintln!("VERDANT_CONSUMER_REJECTED: {error}");
        std::process::exit(1);
    }
}
