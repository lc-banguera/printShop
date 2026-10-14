import * as React from "react";
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Download,
  Eye,
  Edit2,
  Copy,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { StatusDot } from "./StatusDot";
import { ProductForm } from "./product-form/ProductForm";
import type { DynamicProductDraft } from "./product-model";
import { useProductRepository } from "./product-repository";

/* ── Interfaces ─────────────────────────────────────────────────────────── */
export interface StoreProductItem {
  id: string;
  name: string;
  sku: string;
  category: "Camisetas" | "Hoodies" | "Tazas" | "Gorras" | "Bolsos" | "Pósters";
  price: number;
  originalPrice?: number;
  stock: number;
  variantsCount: number;
  status: "Publicado" | "Borrador" | "Agotado" | "Pausado";
  image: string;
  salesCount: number;
  availableSizes: string[];
  availableColors: string[];
}

/* ── Mock Data ───────────────────────────────────────────────────────────── */
const initialProducts: StoreProductItem[] = [
  {
    id: "prod-1",
    name: "Camiseta Oversize Premium 240g",
    sku: "CAM-OVR-001",
    category: "Camisetas",
    price: 54900,
    originalPrice: 65000,
    stock: 84,
    variantsCount: 16,
    status: "Publicado",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&auto=format&fit=crop&q=80",
    salesCount: 234,
    availableSizes: ["S", "M", "L", "XL", "2XL"],
    availableColors: ["Negro", "Blanco", "Gris Melange", "Beige Arena"],
  },
  {
    id: "prod-2",
    name: "Hoodie Clásico Streetwear con Capucha",
    sku: "HOD-CLS-002",
    category: "Hoodies",
    price: 119000,
    originalPrice: 135000,
    stock: 32,
    variantsCount: 12,
    status: "Publicado",
    image:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300&auto=format&fit=crop&q=80",
    salesCount: 176,
    availableSizes: ["M", "L", "XL"],
    availableColors: ["Negro Onix", "Gris Oscuro", "Blanco Hueso"],
  },
  {
    id: "prod-3",
    name: "Taza Cerámica Mágica 11oz",
    sku: "TAZ-CER-003",
    category: "Tazas",
    price: 32000,
    stock: 5,
    variantsCount: 4,
    status: "Publicado",
    image:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80",
    salesCount: 162,
    availableSizes: ["11 oz", "15 oz"],
    availableColors: ["Blanco Brillante", "Negro Mate"],
  },
  {
    id: "prod-4",
    name: "Gorra Urbana 5 Paneles Bordada",
    sku: "GOR-URB-004",
    category: "Gorras",
    price: 42000,
    stock: 3,
    variantsCount: 6,
    status: "Publicado",
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&auto=format&fit=crop&q=80",
    salesCount: 98,
    availableSizes: ["Ajustable"],
    availableColors: ["Negro", "Verde Militar", "Azul Marino"],
  },
  {
    id: "prod-5",
    name: "Bolsa Ecológica Tote Bag 100% Lona",
    sku: "BOL-TOT-005",
    category: "Bolsos",
    price: 28000,
    stock: 45,
    variantsCount: 3,
    status: "Publicado",
    image:
      "https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=300&auto=format&fit=crop&q=80",
    salesCount: 112,
    availableSizes: ["Estándar 38x42 cm"],
    availableColors: ["Crudo Natural", "Negro Lavado"],
  },
  {
    id: "prod-6",
    name: "Póster Metálico High-Gloss A3",
    sku: "POS-MET-006",
    category: "Pósters",
    price: 45000,
    stock: 0,
    variantsCount: 2,
    status: "Agotado",
    image:
      "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?w=300&auto=format&fit=crop&q=80",
    salesCount: 64,
    availableSizes: ["A3 (30x42 cm)", "A2 (42x60 cm)"],
    availableColors: ["Acabado Mate", "Acabado Brillante"],
  },
  {
    id: "prod-7",
    name: "Camiseta Regular Fit Básica Estampada",
    sku: "CAM-BAS-007",
    category: "Camisetas",
    price: 39000,
    stock: 18,
    variantsCount: 8,
    status: "Borrador",
    image:
      "https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=300&auto=format&fit=crop&q=80",
    salesCount: 0,
    availableSizes: ["S", "M", "L"],
    availableColors: ["Blanco", "Negro"],
  },
];

export default function StoreProducts() {
  const navigate = useNavigate();
  const publishToRepository = useProductRepository((state) => state.publish);
  const [products, setProducts] =
    React.useState<StoreProductItem[]>(initialProducts);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] =
    React.useState<string>("Todas");
  const [selectedStatus] = React.useState<string>("Todos");

  // Modal Crear / Editar
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] =
    React.useState<StoreProductItem | null>(null);


  // Notification Toast
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // KPIs
  const stats = React.useMemo(() => {
    return {
      publicados: products.filter((p) => p.status === "Publicado").length,
      borradores: products.filter((p) => p.status === "Borrador").length,
      bajoInventario: products.filter((p) => p.stock > 0 && p.stock <= 5)
        .length,
      sinInventario: products.filter((p) => p.stock === 0).length,
    };
  }, [products]);

  // Filtrado
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat =
        selectedCategory === "Todas" || p.category === selectedCategory;
      const matchStatus =
        selectedStatus === "Todos" || p.status === selectedStatus;
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus]);

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };


  const handleDynamicPublish = (draft: DynamicProductDraft) => {
    const newProduct: StoreProductItem = {
      id: editingProduct?.id || `prod-${Date.now()}`,
      name: draft.name,
      sku: draft.sku,
      category: draft.category,
      price: draft.variants[0]?.price || draft.price,
      stock: draft.variants.length ? draft.variants.reduce((total, variant) => total + variant.inventory, 0) : draft.inventory,
      variantsCount: draft.variants.length,
      status: draft.status === "PUBLISHED" ? "Publicado" : "Borrador",
      image: draft.images.find((image) => image.isPrimary)?.url || draft.images[0]?.url || "",
      salesCount: editingProduct?.salesCount || 0,
      // Attribute labels and values are intentionally retained in the draft;
      // list metadata no longer assumes that every product has size or color.
      availableSizes: [],
      availableColors: [],
    };
    publishToRepository({ ...draft, id: newProduct.id });
    setProducts((current) => editingProduct ? current.map((product) => product.id === editingProduct.id ? newProduct : product) : [newProduct, ...current]);
    showToast(draft.status === "PUBLISHED" ? `Producto "${draft.name}" publicado correctamente` : `Borrador "${draft.name || 'sin nombre'}" guardado correctamente`);
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1400px] mx-auto w-full">
      {/* ── Toast de Feedback ──────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-[#111827] text-white text-xs font-semibold rounded-lg shadow-xl animate-in fade-in">
          <Check className="w-4 h-4 text-[#10B981]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Encabezado Principal ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827]">
            Catálogo de Productos
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Administra tus productos, inventario, precios y variantes listos
            para estampar con tus diseños.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#334155] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] px-3.5 py-2 rounded-[6px] shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Exportar Productos</span>
          </button>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] px-4 py-2 rounded-[6px] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* ── Tarjetas Resumen (KPIs) ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-[8px] bg-white border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs font-medium text-[#64748B]">
            Publicados activos
          </span>
          <p className="text-2xl font-black text-[#111827] mt-1">
            {stats.publicados}
          </p>
          <span className="text-[11px] text-[#64748B] font-medium mt-1 inline-block">
            Visibles en la tienda pública
          </span>
        </div>

        <div className="p-4 rounded-[8px] bg-white border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs font-medium text-[#64748B]">
            Borradores / En edición
          </span>
          <p className="text-2xl font-black text-[#111827] mt-1">
            {stats.borradores}
          </p>
          <span className="text-[11px] text-[#64748B] font-medium mt-1 inline-block">
            Pendientes por publicar
          </span>
        </div>

        <div className="p-4 rounded-[8px] bg-white border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs font-medium text-[#64748B]">
            Bajo inventario
          </span>
          <p className="text-2xl font-black text-[#111827] mt-1">
            {stats.bajoInventario}
          </p>
          <span className="text-[11px] text-[#64748B] font-medium mt-1 inline-block">
            5 o menos unidades
          </span>
        </div>

        <div className="p-4 rounded-[8px] bg-white border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs font-medium text-[#64748B]">
            Sin inventario / Agotados
          </span>
          <p className="text-2xl font-black text-[#111827] mt-1">
            {stats.sinInventario}
          </p>
          <span className="text-[11px] text-[#64748B] font-medium mt-1 inline-block">
            Requiere reposición
          </span>
        </div>
      </div>

      {/* ── Barra de Búsqueda y Filtros de Categoría ───────────────── */}
      <div className="bg-white p-3 rounded-[8px] border border-[#E5E7EB] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {["Todas", "Camisetas", "Hoodies", "Tazas", "Gorras", "Bolsos"].map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1 text-xs rounded-full font-medium transition-colors",
                  selectedCategory === cat
                    ? "bg-[#2563EB] text-white"
                    : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]",
                )}
              >
                {cat}
              </button>
            ),
          )}
        </div>
      </div>

      {/* ── Tabla de Productos ─────────────────────────────────────── */}
      <div className="bg-white rounded-[8px] border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[#64748B] text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Precio</th>
                <th className="py-3 px-4">Disponibilidad</th>
                <th className="py-3 px-4">Variantes</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#94A3B8]">
                    <Package className="w-8 h-8 mx-auto mb-2 text-[#CBD5E1]" />
                    <p className="font-semibold text-sm text-[#475569]">
                      No se encontraron productos
                    </p>
                    <p className="text-xs text-[#94A3B8]">
                      Prueba con otro término de búsqueda o categoría.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover border border-[#E2E8F0] shrink-0"
                        />
                        <div>
                          <p className="font-bold text-[#111827]">
                            {product.name}
                          </p>
                          <p className="text-[11px] text-[#94A3B8] font-mono">
                            {product.sku}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#475569]">
                      {product.category}
                    </td>
                    <td className="py-3.5 px-4 font-black text-[#111827]">
                      $ {product.price.toLocaleString("es-CO")}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#111827]">
                      {product.stock === 0
                        ? "Agotado"
                        : `${product.stock} unids`}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      {product.variantsCount} opciones
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusDot status={product.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => navigate(`/products/${product.id}`)}
                          className="p-1.5 text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5F9] rounded transition-colors"
                          title="Ver producto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(product);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5F9] rounded transition-colors"
                          title="Editar producto"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            showToast(`Copia creada de ${product.name}`)
                          }
                          className="p-1.5 text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5F9] rounded transition-colors"
                          title="Duplicar"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"><div className="bg-white rounded-[8px] max-w-3xl h-[92vh] w-full flex flex-col overflow-hidden shadow-2xl border border-[#E2E8F0]"><div className="shrink-0 flex items-center justify-between border-b border-[#F1F5F9] px-5 sm:px-6 py-4"><h2 className="text-base font-bold text-[#111827]">{editingProduct ? "Editar Producto" : "Nuevo Producto"}</h2><button type="button" onClick={() => setIsModalOpen(false)} className="p-1 text-[#94A3B8] hover:text-[#111827] rounded-[5px]"><X className="w-5 h-5" /></button></div><div className="min-h-0 overflow-y-auto px-5 sm:px-6 py-5"><ProductForm initial={editingProduct ? { name: editingProduct.name, category: editingProduct.category, sku: editingProduct.sku, identifiers: { sku: editingProduct.sku }, description: '', price: editingProduct.price, inventory: editingProduct.stock, attributes: [], variationAttributeIds: [], variants: [], images: [], customization: { zones: [] }, status: editingProduct.status === 'Borrador' ? 'DRAFT' : 'PUBLISHED' } : undefined} skuSequence={products.length + 1} onCancel={() => setIsModalOpen(false)} onPublish={handleDynamicPublish} onSaveDraft={handleDynamicPublish}/></div></div></div>}

    </div>
  );
}
