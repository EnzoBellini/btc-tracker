import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { Settings, InsertSettings } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { getT } from "@/lib/locale-runtime";

export function useSettings() {
  return useQuery<Settings>({
    queryKey: ["/api/settings"],
    staleTime: 60_000,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<InsertSettings>) =>
      apiRequest("PATCH", "/api/settings", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/settings"] });
      qc.invalidateQueries({ queryKey: ["/api/stats"] });
      toast.success(getT().toasts.settingsSaved);
    },
    onError: () => toast.error(getT().toasts.settingsError),
  });
}
