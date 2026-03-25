import { Body, Controller, Get, Inject, Post } from "@nestjs/common";

import { Material, MaterialService, SaveMaterialRequest } from "./material.service";

@Controller("admin/materials")
export class MaterialController {
  private readonly materialService: MaterialService;

  constructor(@Inject(MaterialService) materialService: MaterialService) {
    this.materialService = materialService;
  }

  @Get()
  listMaterials(): Material[] {
    return this.materialService.listMaterials();
  }

  @Post()
  saveMaterial(@Body() request: SaveMaterialRequest): Material {
    return this.materialService.saveMaterial(request);
  }
}
