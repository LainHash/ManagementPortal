import { useEffect, useState, useCallback } from "react";
import { inventoryApi } from "../api/inventory.api";
import { catalogApi } from "@/features/catalog/api/catalog.api";
import { territoryApi } from "@/features/territory/api/territory.api";
import type { IngredientCategoryResponse } from "@/types/inventory.types";
import type { BrandResponse, UnitResponse } from "@/types/catalog.types";
import type { BranchResponse } from "@/types/territory.types";

export function useInventoryOptions() {
  const [categories, setCategories] = useState<IngredientCategoryResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [units, setUnits] = useState<UnitResponse[]>([]);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, brandRes, unitRes, branchRes] = await Promise.all([
        inventoryApi.categories.getAll({ pageSize: 100 }).catch(() => null),
        catalogApi.brands.getAll({ pageSize: 100 }).catch(() => null),
        catalogApi.units.getAll({ pageSize: 100 }).catch(() => null),
        territoryApi.branches.getAll({ pageSize: 100 }).catch(() => null),
      ]);

      if (catRes?.data) setCategories(catRes.data);
      if (brandRes?.data) setBrands(brandRes.data);
      if (unitRes?.data) setUnits(unitRes.data);
      if (branchRes?.data) setBranches(branchRes.data);
    } catch (err: any) {
      setError(err?.message || "Không thể tải danh sách tùy chọn kho nguyên liệu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  return {
    categories,
    brands,
    units,
    branches,
    loading,
    error,
    refreshOptions: fetchOptions,
  };
}
