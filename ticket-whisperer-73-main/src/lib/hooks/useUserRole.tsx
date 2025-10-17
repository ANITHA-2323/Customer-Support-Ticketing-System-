import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const useUserRole = () => {
  const { user } = useAuth();

  const { data: userRoles, isLoading } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const isAdmin = userRoles?.some(r => r.role === "admin") ?? false;
  const isAgent = userRoles?.some(r => r.role === "agent") ?? false;
  const isUser = userRoles?.some(r => r.role === "user") ?? false;

  return { isAdmin, isAgent, isUser, isLoading };
};
