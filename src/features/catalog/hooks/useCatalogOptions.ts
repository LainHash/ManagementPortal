import { useEffect, useState, useCallback } from "react";
import { catalogApi } from "../api/catalog.api";
import { territoryApi } from "@/features/territory/api/territory.api";
import type {
  ProductCategoryResponse,
  BrandResponse,
  UnitResponse,
} from "@/types/catalog.types";
import type { BranchResponse } from "@/types/territory.types";

export function useCatalogOptions() {
  const [categories, setCategories] = useState<ProductCategoryResponse[]>([]);
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
        catalogApi.categories.getAll({ pageSize: 100 }).catch(() => null),
        catalogApi.brands.getAll({ pageSize: 100 }).catch(() => null),
        catalogApi.units.getAll({ pageSize: 100 }).catch(() => null),
        territoryApi.branches.getAll({ pageSize: 100 }).catch(() => null),
      ]);

      if (catRes?.data) setCategories(catRes.data);
      if (brandRes?.data) setBrands(brandRes.data);
      if (unitRes?.data) setUnits(unitRes.data);
      if (branchRes?.data) setBranches(branchRes.data);
    } catch (err: any) {
      setError(err?.message || "Không thể tải danh sách tùy chọn catalog.");
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
