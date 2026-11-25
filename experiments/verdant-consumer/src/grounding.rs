//! Terrain-conforming authored ribbons and object anchors for the Verdant consumer.
//! Verdant owns the terrain mesh and GLB export. These small authoring utilities
//! keep companion-safe route artwork aligned with the actual generated surface.
use verdant_core::geometry::ProceduralMesh;

/// Interpolates the height of the *actual exported terrain mesh*, not an
/// independent copy of Verdant's procedural height formula.
pub fn terrain_height_at(terrain: &ProceduralMesh, x: f64, z: f64) -> Result<f64, String> {
    if !x.is_finite() || !z.is_finite() {
        return Err("non-finite surface sample".into());
    }
    for tri in terrain.indices.chunks_exact(3) {
        let a = terrain.positions[tri[0] as usize];
        let b = terrain.positions[tri[1] as usize];
        let c = terrain.positions[tri[2] as usize];
        let ax = f64::from(a[0]);
        let az = f64::from(a[2]);
        let ux = f64::from(b[0]) - ax;
        let uz = f64::from(b[2]) - az;
        let vx = f64::from(c[0]) - ax;
        let vz = f64::from(c[2]) - az;
        let determinant = ux * vz - uz * vx;
        if determinant.abs() < 1e-12 {
            continue;
        }
        let px = x - ax;
        let pz = z - az;
        let weight_b = (px * vz - pz * vx) / determinant;
        let weight_c = (ux * pz - uz * px) / determinant;
        if weight_b >= -1e-7 && weight_c >= -1e-7 && weight_b + weight_c <= 1.0 + 1e-7 {
            return Ok(f64::from(a[1])
                + weight_b * (f64::from(b[1]) - f64::from(a[1]))
                + weight_c * (f64::from(c[1]) - f64::from(a[1])));
        }
    }
    Err(format!("no terrain surface under ({x:.3}, {z:.3})"))
}

/// Creates a tessellated, terrain-following ribbon using Verdant's mesh type.
/// `half_width` is measured on each side of the centerline. Endpoint lift
/// allows a gentle approach to a bridge without changing the base terrain.
#[allow(clippy::too_many_arguments)]
pub fn terrain_ribbon(
    name: &str,
    terrain: &ProceduralMesh,
    start: (f64, f64),
    end: (f64, f64),
    half_width: f64,
    clearance: f64,
    start_lift: f64,
    end_lift: f64,
    segments: usize,
    rgba: [f32; 4],
) -> Result<ProceduralMesh, String> {
    let (dx, dz) = (end.0 - start.0, end.1 - start.1);
    let length = dx.hypot(dz);
    if !length.is_finite() || length <= 1e-3
        || !half_width.is_finite() || !(0.05..=2.0).contains(&half_width)
        || !clearance.is_finite() || !(-0.1..=1.2).contains(&clearance)
        || !start_lift.is_finite() || !(0.0..=1.5).contains(&start_lift)
        || !end_lift.is_finite() || !(0.0..=1.5).contains(&end_lift)
        || !(4..=96).contains(&segments)
        || !rgba.iter().all(|v| v.is_finite() && (0.0..=1.0).contains(v)) {
        return Err("invalid authored ribbon configuration".into());
    }
    let normal_offset = (-dz / length * half_width, dx / length * half_width);
    let mut positions = Vec::with_capacity((segments + 1) * 2);
    let mut normals = Vec::with_capacity((segments + 1) * 2);
    let mut uvs = Vec::with_capacity((segments + 1) * 2);
    let mut colors = Vec::with_capacity((segments + 1) * 2);
    let mut indices = Vec::with_capacity(segments * 6);

    for i in 0..=segments {
        let t = (i as f64) / (segments as f64);
        let x = start.0 + dx * t;
        let z = start.1 + dz * t;
        let lift = start_lift * (1.0 - t) + end_lift * t;
        for side in [1.0, -1.0] {
            let px = x + side * normal_offset.0;
            let pz = z + side * normal_offset.1;
            let height = terrain_height_at(terrain, px, pz)? + clearance + lift;
            positions.push([px as f32, height as f32, pz as f32]);
            normals.push([0.0, 1.0, 0.0]);
            uvs.push([t as f32, if side > 0.0 { 0.0 } else { 1.0 }]);
            colors.push(rgba);
        }
    }
    for i in 0..segments {
        let a = (2 * i) as u32;
        let b = a + 1;
        let c = a + 2;
        let d = a + 3;
        indices.extend_from_slice(&[a, c, d, a, d, b]);
    }
    let mesh = ProceduralMesh {
        name: name.to_string(),
        positions,
        normals,
        uvs,
        colors,
        indices,
        morph_targets: Vec::new(),
    };
    mesh.validate().map_err(|e| format!("terrain ribbon invalid: {e}"))?;
    Ok(mesh)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_terrain() -> ProceduralMesh {
        ProceduralMesh {
            name: "ground-test".into(),
            positions: vec![
                [-2.0, 0.0, -2.0], [2.0, 0.0, -2.0],
                [2.0, 1.0, 2.0], [-2.0, 1.0, 2.0],
            ],
            normals: vec![[0.0, 1.0, 0.0]; 4],
            uvs: vec![[0.0, 0.0]; 4],
            colors: vec![[0.5, 0.7, 0.5, 1.0]; 4],
            indices: vec![0, 1, 2, 0, 2, 3],
            morph_targets: Vec::new(),
        }
    }

    #[test]
    fn actual_mesh_surface_interpolation_and_outside_refusal() {
        let mesh = sample_terrain();
        assert!((terrain_height_at(&mesh, 0.0, 0.0).unwrap() - 0.5).abs() < 1e-5);
        assert!((terrain_height_at(&mesh, -1.0, -1.0).unwrap() - 0.25).abs() < 1e-5);
        assert!(terrain_height_at(&mesh, 5.0, 0.0).is_err());
        assert!(terrain_height_at(&mesh, f64::NAN, 0.0).is_err());
    }

    #[test]
    fn ribbon_samples_surface_at_both_edges_and_preserves_a_bridge_ramp() {
        let ground = sample_terrain();
        let mesh = terrain_ribbon(
            "walk", &ground, (-1.0, 0.0), (1.0, 0.0),
            0.2, 0.07, 0.0, 0.8, 8, [0.7, 0.6, 0.5, 1.0],
        ).unwrap();
        assert_eq!(mesh.triangle_count(), 16);
        assert_eq!(mesh.vertex_count(), 18);
        for pair in mesh.positions.chunks_exact(2) {
            for point in pair {
                let ground_height = terrain_height_at(&ground, f64::from(point[0]), f64::from(point[2])).unwrap();
                let clearance = f64::from(point[1]) - ground_height;
                assert!((0.07 - 1e-5..=0.87 + 1e-5).contains(&clearance));
            }
        }
        mesh.validate().unwrap();
    }

    #[test]
    fn ribbon_refuses_zero_length_and_unbounded_width() {
        let ground = sample_terrain();
        assert!(terrain_ribbon("bad", &ground, (0.0, 0.0), (0.0, 0.0), 0.3, 0.05, 0.0, 0.0, 8, [0.3, 0.7, 0.3, 1.0]).is_err());
        assert!(terrain_ribbon("bad", &ground, (0.0, 0.0), (1.0, 0.0), 9.0, 0.05, 0.0, 0.0, 8, [0.3, 0.7, 0.3, 1.0]).is_err());
    }
}
