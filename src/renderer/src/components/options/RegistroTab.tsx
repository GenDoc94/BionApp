import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type RegistroRow = {
  id: number;
  Fecha: string;
  Usuario: string;
  Accion: string;
  Tabla: string;
  Detalle: string;
  IP: string;
  Equipo: string;
};

function formatWhen(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso || "—";
  return d.toLocaleString(locale === "en" ? "en-GB" : "es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function RegistroTab() {
  const { t, i18n } = useTranslation();
  const [rows, setRows] = useState<RegistroRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("Registro")
        .select("id, Fecha, Usuario, Accion, Tabla, Detalle, IP, Equipo")
        .order("id", { ascending: false })
        .limit(500);
      if (error) throw error;
      setRows(Array.isArray(data) ? (data as RegistroRow[]) : []);
    } catch (err) {
      console.error(err);
      toast.error(t("options.log.loadError"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const hay = [
        row.Usuario,
        row.Accion,
        row.Tabla,
        row.Detalle,
        row.IP,
        row.Equipo,
        formatWhen(row.Fecha, i18n.language),
        t(`options.log.action.${row.Accion}`, { defaultValue: row.Accion }),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query, i18n.language, t]);

  return (
    <div className="space-y-4">
      <div className="bionapp-panel p-4 space-y-3">
        <div>
          <div className="font-semibold">{t("options.log.title")}</div>
          <p className="text-xs text-slate-500 mt-1">{t("options.log.help")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("options.log.search")}
              className="pl-8"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <Button type="button" size="sm" variant="outline" onClick={() => void load()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {t("options.log.refresh")}
          </Button>
        </div>
      </div>

      <div className="bionapp-panel p-4">
        {loading && !rows.length ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("options.loading")}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-500">
            {rows.length ? t("options.log.noMatches") : t("options.log.empty")}
          </p>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-[720px] w-full text-sm border-collapse">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="py-2 pr-3 whitespace-nowrap">{t("options.log.col.when")}</th>
                  <th className="py-2 pr-3">{t("options.log.col.user")}</th>
                  <th className="py-2 pr-3">{t("options.log.col.origin")}</th>
                  <th className="py-2 pr-3">{t("options.log.col.action")}</th>
                  <th className="py-2 pr-3">{t("options.log.col.table")}</th>
                  <th className="py-2 pr-3">{t("options.log.col.detail")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const origin = [row.IP, row.Equipo].filter(Boolean).join(" · ") || "—";
                  return (
                    <tr key={row.id} className="border-b border-border/60 align-top">
                      <td className="py-2 pr-3 whitespace-nowrap text-xs">
                        {formatWhen(row.Fecha, i18n.language)}
                      </td>
                      <td className="py-2 pr-3">{row.Usuario || "—"}</td>
                      <td className="py-2 pr-3 text-xs" title={origin}>
                        {origin}
                      </td>
                      <td className="py-2 pr-3 whitespace-nowrap">
                        {t(`options.log.action.${row.Accion}`, { defaultValue: row.Accion })}
                      </td>
                      <td className="py-2 pr-3 whitespace-nowrap">{row.Tabla}</td>
                      <td className="py-2 pr-3 text-xs text-slate-600 dark:text-slate-300 break-all">
                        {row.Detalle || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
