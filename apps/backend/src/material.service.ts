import { Injectable } from "@nestjs/common";

export type Material = {
  materialId: string;
  materialName: string;
  shelfLifeDays: number;
  purchaseUnit: number;
  leadTimeDays: number;
  supplierName: string;
};

export type SaveMaterialRequest = Material;

@Injectable()
export class MaterialService {
  private readonly materials: Material[] = [
    {
      materialId: "MAT-001",
      materialName: "バラ赤",
      shelfLifeDays: 5,
      purchaseUnit: 10,
      leadTimeDays: 2,
      supplierName: "東京フラワー商事",
    },
    {
      materialId: "MAT-002",
      materialName: "カスミソウ",
      shelfLifeDays: 4,
      purchaseUnit: 6,
      leadTimeDays: 1,
      supplierName: "関東グリーンサプライ",
    },
  ];

  listMaterials(): Material[] {
    return [...this.materials];
  }

  saveMaterial(request: SaveMaterialRequest): Material {
    const index = this.materials.findIndex((material) => material.materialId === request.materialId);

    if (index >= 0) {
      this.materials[index] = { ...request };
      return this.materials[index];
    }

    this.materials.push({ ...request });
    return request;
  }

  findMaterial(materialId: string): Material | undefined {
    return this.materials.find((material) => material.materialId === materialId);
  }
}
