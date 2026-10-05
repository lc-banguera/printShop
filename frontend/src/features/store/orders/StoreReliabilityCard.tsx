import * as React from "react";
import { Store, Star, Award, Clock, CheckCircle } from "lucide-react";
import { SelectedStoreInfo } from "./types";

interface StoreReliabilityCardProps {
  storeInfo: SelectedStoreInfo;
}

export const StoreReliabilityCard: React.FC<StoreReliabilityCardProps> = ({ storeInfo }) => {
  const rel = storeInfo.reliabilitySnapshot;

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
          <Store className="w-3.5 h-3.5 text-[#64748B]" />
          <span>Tienda Asignada para Fabricación</span>
        </h3>
        <span className="text-[10px] font-semibold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded">
          Taller Seleccionado
        </span>
      </div>

      <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-xs text-[#111827]">
              {storeInfo.storeNameSnapshot}
            </p>
            <p className="text-[11px] text-[#64748B]">
              ID Tienda: {storeInfo.storeId} • Vendedor: {storeInfo.sellerId}
            </p>
          </div>

          {rel?.rating && (
            <div className="flex items-center gap-1 bg-white border border-[#E2E8F0] px-2 py-1 rounded shadow-2xs">
              <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
              <span className="font-bold text-[#111827] text-xs">{rel.rating}</span>
            </div>
          )}
        </div>

        {rel && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-[#E2E8F0]/70 text-[11px]">
            {rel.completedOrdersCount && (
              <div>
                <span className="text-[10px] text-[#64748B] block">Órdenes Realizadas</span>
                <span className="font-semibold text-[#111827]">
                  {rel.completedOrdersCount} pedidos
                </span>
              </div>
            )}

            {rel.onTimeDeliveryRate && (
              <div>
                <span className="text-[10px] text-[#64748B] block">Puntualidad en Taller</span>
                <span className="font-semibold text-[#111827]">
                  {rel.onTimeDeliveryRate}% a tiempo
                </span>
              </div>
            )}

            {rel.operatingSince && (
              <div>
                <span className="text-[10px] text-[#64748B] block">Operando Desde</span>
                <span className="font-semibold text-[#111827]">{rel.operatingSince}</span>
              </div>
            )}
          </div>
        )}

        {rel?.specialties && rel.specialties.length > 0 && (
          <div className="pt-1.5 flex flex-wrap items-center gap-1.5">
            {rel.specialties.map((spec, i) => (
              <span
                key={i}
                className="text-[10px] font-medium text-[#475569] bg-white border border-[#E2E8F0] px-1.5 py-0.5 rounded"
              >
                {spec}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
