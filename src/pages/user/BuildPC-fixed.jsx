import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { productService } from "../../services/productService";
import { formatCurrency } from "../../utils/formatCurrency";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

// Helper function to safely get product name from various API response formats
const getProductName = (item) => {
  return (
    item.tenSP ||
    item.tenSanPham ||
    item.name ||
    item.tenSanPham ||
    "Unknown Product"
  );
};

// Helper function to safely get product price from various API response formats
const getProductPrice = (item) => {
  return (
    item.gia || item.giaBan || item.donGia || item.price || item.giaTien || 0
  );
};

// Helper function to safely get product ID from various API response formats
const getProductId = (item) => {
  return item.maSP || item.maLinhKien || item.id || item.idSanPham || null;
};

// Helper function to extract capacity (GB/TB) from product name using regex
// Examples: "Teamgroup 16GB" -> "16GB", "Kioxia 512GB Gen4" -> "512GB", "2TB" -> "2TB"
const extractCapacityFromName = (name) => {
  if (!name) return null;

  // Match patterns like: 512GB, 1TB, 2GB, 4TB, 8tb, 16gB, etc.
  const match = name.match(/(\d+(?:\.\d+)?)\s*(GB|MB|TB)/i);
  if (match) {
    return `${match[1]}${match[2].toUpperCase()}`;
  }
  return null;
};

// Helper function to extract numeric TDP value from string
const extractTDP = (tdp) => {
  if (!tdp) return null;
  const match = String(tdp).match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

// Helper function to extract wattage from PSU name
const extractWattage = (name) => {
  if (!name) return null;
  const match = name.match(/(\d+)\s*W/i);
  return match ? parseInt(match[1], 10) : null;
};

// Helper function to format product object for Cart
const formatProductForCart = (item) => {
  const price = getProductPrice(item);
  return {
    maSP: getProductId(item),
    tenSP: getProductName(item),
    giaBan: price,
    donGia: price,
    hinhAnh: item.anhDaiDien || item.hinhAnh || item.image || null,
    soLuong: 1,
    quantity: 1,
  };
};

export default function BuildPC() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem } = useCart();

  // State cho danh sách linh kiện
  const [cpus, setCpus] = useState([]);
  const [mainboards, setMainboards] = useState([]);
  const [rams, setRams] = useState([]);
  const [gpus, setGpus] = useState([]);
  const [ssds, setSsds] = useState([]);
  const [psus, setPsus] = useState([]);
  const [cases, setCases] = useState([]);

  // State cho linh kiện đã chọn
  const [cpuId, setCpuId] = useState(null);
  const [mainboardId, setMainboardId] = useState(null);
  const [ramId, setRamId] = useState(null);
  const [gpuId, setGpuId] = useState(null);
  const [ssdId, setSsdId] = useState(null);
  const [psuId, setPsuId] = useState(null);
  const [caseId, setCaseId] = useState(null);

  // State cho tổng tiền
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  // Helper to get selected item - phải khai báo TRƯỚC khi sử dụng
  const getSelectedItem = (list, value) => {
    if (!value) return null;
    return list.find((item) => String(getProductId(item)) === String(value));
  };

  // Get computed selected items - phải khai báo SAU getSelectedItem và TRƯỚC khi sử dụng trong các hàm
  const selectedCPU = getSelectedItem(cpus, cpuId);
  const selectedMainboard = getSelectedItem(mainboards, mainboardId);
  const selectedRAM = getSelectedItem(rams, ramId);
  const selectedGPU = getSelectedItem(gpus, gpuId);
  const selectedSSD = getSelectedItem(ssds, ssdId);
  const selectedPSU = getSelectedItem(psus, psuId);
  const selectedCase = getSelectedItem(cases, caseId);

  // Load all components on page load
  useEffect(() => {
    document.title = "Build PC - Tự cấu hình máy tính | TechStore";
    loadAllComponents();
  }, []);

  // Xử lý khi có editBuildData được truyền từ SavedBuilds
  useEffect(() => {
    const editBuildData = location.state?.editBuildData;

    if (editBuildData && !loading) {
      if (editBuildData.maCauHinh || editBuildData.id) {
        // Load the components - we don't show saved config name anymore
      }

      const components =
        editBuildData.danhSachLinhKien ||
        editBuildData.linhKiens ||
        editBuildData.components ||
        [];

      components.forEach((item) => {
        const maSP = item.maSP || item.maLinhKien || item.id || item.idSanPham;
        const loai = item.loai || item.loaiLinhKien || item.type || "";

        if (!maSP) return;

        const loaiLower = String(loai).toLowerCase();

        if (loaiLower.includes("cpu")) {
          setCpuId(maSP);
        } else if (
          loaiLower.includes("mainboard") ||
          loaiLower.includes("bo mạch")
        ) {
          setMainboardId(maSP);
        } else if (loaiLower.includes("ram")) {
          setRamId(maSP);
        } else if (loaiLower.includes("gpu") || loaiLower.includes("card")) {
          setGpuId(maSP);
        } else if (loaiLower.includes("ssd") || loaiLower.includes("ổ cứng")) {
          setSsdId(maSP);
        } else if (loaiLower.includes("psu") || loaiLower.includes("nguồn")) {
          setPsuId(maSP);
        } else if (loaiLower.includes("case") || loaiLower.includes("vỏ")) {
          setCaseId(maSP);
        }
      });

      navigate(location.pathname, { replace: true });
      toast.success("Đã tải cấu hình đã lưu!");
    }
  }, [location.state, loading]);

  // Load all components with client-side filtering for robustness
  const loadAllComponents = async () => {
    setLoading(true);
    try {
      // Fetch all products once
      const productResponse = await productService.getAll();
      const allData = Array.isArray(productResponse)
        ? productResponse
        : productResponse?.data || [];

      // Debug logs
      console.log("All products:", allData);
      if (allData.length > 0) {
        console.log("Category sample:", allData[0]);
      }

      // Hàm helper an toàn để kiểm tra từ khóa (tránh lỗi undefined.match làm crash)
      const checkKeyword = (item, regexPattern) => {
        const name = item?.tenSP || item?.name || item?.tenSanPham || "";
        return regexPattern.test(name.toLowerCase());
      };

      // Lọc dữ liệu an toàn bằng hàm test()
      const cpuData = allData.filter((item) =>
        checkKeyword(item, /intel|ryzen|cpu/),
      );
      const mainboardData = allData.filter((item) =>
        checkKeyword(item, /mainboard|b760|b660|h610|z790|x670/),
      );
      const ramData = allData.filter((item) =>
        checkKeyword(item, /ram|ddr4|ddr5/),
      );
      const gpuData = allData.filter((item) =>
        checkKeyword(item, /rtx|gtx|rx|vga|gpu/),
      );
      const ssdData = allData.filter((item) => checkKeyword(item, /ssd|nvme/));
      const psuData = allData.filter((item) =>
        checkKeyword(item, /psu|nguồn|rm\d+|hx\d+|80\+/),
      );
      const caseData = allData.filter((item) =>
        checkKeyword(item, /lancool|lian li|case|vỏ|tower/),
      );

      // Cập nhật State
      setCpus(cpuData);
      setMainboards(mainboardData);
      setRams(ramData);
      setGpus(gpuData);
      setSsds(ssdData);
      setPsus(psuData);
      setCases(caseData);

      // Debug logs để kiểm tra số lượng linh kiện đã lọc được
      console.log(
        `CPUs: ${cpuData.length}, Mainboards: ${mainboardData.length}, RAMs: ${ramData.length}, GPUs: ${gpuData.length}, SSDs: ${ssdData.length}, PSUs: ${psuData.length}, Cases: ${caseData.length}`,
      );

      toast.success("Đã tải đầy đủ danh sách linh kiện!");
    } catch (error) {
      console.error("Failed to load components:", error);
      toast.error("Không thể tải danh sách linh kiện!");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    let total = 0;

    if (cpuId) {
      const cpu = cpus.find((c) => getProductId(c) === cpuId);
      if (cpu) total += getProductPrice(cpu);
    }
    if (mainboardId) {
      const mb = mainboards.find((c) => getProductId(c) === mainboardId);
      if (mb) total += getProductPrice(mb);
    }
    if (ramId) {
      const ram = rams.find((c) => getProductId(c) === ramId);
      if (ram) total += getProductPrice(ram);
    }
    if (gpuId) {
      const gpu = gpus.find((c) => getProductId(c) === gpuId);
      if (gpu) total += getProductPrice(gpu);
    }
    if (ssdId) {
      const ssd = ssds.find((c) => getProductId(c) === ssdId);
      if (ssd) total += getProductPrice(ssd);
    }
    if (psuId) {
      const psu = psus.find((c) => getProductId(c) === psuId);
      if (psu) total += getProductPrice(psu);
    }
    if (caseId) {
      const pcCase = cases.find((c) => getProductId(c) === caseId);
      if (pcCase) total += getProductPrice(pcCase);
    }

    setTotalPrice(total);
  };

  // Recalculate when selection changes
  useEffect(() => {
    if (!loading) {
      calculateTotal();
    }
  }, [cpuId, mainboardId, ramId, gpuId, ssdId, psuId, caseId, loading]);

  // Calculate total RAM capacity from selected RAM
  const getTotalRAMCapacity = () => {
    if (!ramId) return null;
    const ram = getSelectedItem(rams, ramId);
    if (!ram) return null;

    const name = getProductName(ram);
    const capacity = extractCapacityFromName(name);
    return capacity;
  };

  // Get GPU info with VRAM
  const getGPUInfo = () => {
    if (!gpuId) return null;
    const gpu = getSelectedItem(gpus, gpuId);
    if (!gpu) return null;

    const name = getProductName(gpu);
    const vram = extractCapacityFromName(name);

    return {
      name,
      vram,
    };
  };

  // Get SSD capacity
  const getSSDCapacity = () => {
    if (!ssdId) return null;
    const ssd = getSelectedItem(ssds, ssdId);
    if (!ssd) return null;

    const name = getProductName(ssd);
    return extractCapacityFromName(name);
  };

  // Get PSU wattage (numeric)
  const getPSUWattage = () => {
    if (!psuId) return null;
    const psu = getSelectedItem(psus, psuId);
    if (!psu) return null;

    const name = getProductName(psu);
    return extractWattage(name);
  };

  // Calculate total TDP of CPU + GPU
  const getTotalTDP = () => {
    let totalTDP = 0;

    // Get CPU TDP
    if (selectedCPU) {
      const cpuTDP = extractTDP(selectedCPU.tdp);
      if (cpuTDP) totalTDP += cpuTDP;
    }

    // Get GPU TDP (from product data if available)
    if (selectedGPU) {
      const gpuTDP = extractTDP(selectedGPU.tdp);
      if (gpuTDP) totalTDP += gpuTDP;
    }

    return totalTDP > 0 ? totalTDP : null;
  };

  // Check compatibility between selected components
  const checkCompatibility = () => {
    const warnings = [];

    // CPU ↔ Mainboard: Check socket compatibility
    if (selectedCPU && selectedMainboard) {
      const cpuSocket = selectedCPU.socket
        ? String(selectedCPU.socket).toLowerCase().trim()
        : "";
      const mbSocket = selectedMainboard.socket
        ? String(selectedMainboard.socket).toLowerCase().trim()
        : "";

      if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
        warnings.push({
          type: "error",
          message: `CPU socket (${selectedCPU.socket}) không tương thích với Mainboard socket (${selectedMainboard.socket})`,
        });
      }
    }

    // RAM ↔ Mainboard: Check RAM type compatibility
    if (selectedRAM && selectedMainboard) {
      const ramType = selectedRAM.loaiRam
        ? String(selectedRAM.loaiRam).toUpperCase().replace(/\s/g, "")
        : "";
      const mbRamType = selectedMainboard.ramType
        ? String(selectedMainboard.ramType).toUpperCase().replace(/\s/g, "")
        : "";

      // Normalize DDR4/DDR5
      const normalizedRamType = ramType.includes("DDR4")
        ? "DDR4"
        : ramType.includes("DDR5")
          ? "DDR5"
          : "";
      const normalizedMbRamType = mbRamType.includes("DDR4")
        ? "DDR4"
        : mbRamType.includes("DDR5")
          ? "DDR5"
          : "";

      if (
        normalizedRamType &&
        normalizedMbRamType &&
        normalizedRamType !== normalizedMbRamType
      ) {
        warnings.push({
          type: "error",
          message: `RAM ${selectedRAM.loaiRam} không tương thích với Mainboard hỗ trợ ${selectedMainboard.ramType}`,
        });
      }
    }

    // PSU ↔ CPU + GPU: Check power requirements
    const totalTDP = getTotalTDP();
    const psuWattage = getPSUWattage();

    if (psuWattage && totalTDP) {
      const requiredPower = totalTDP + 150; // Add 150W buffer
      if (psuWattage < requiredPower) {
        warnings.push({
          type: "warning",
          message: `PSU ${psuWattage}W có thể không đủ. Cần ít nhất ${requiredPower}W (CPU + GPU TDP: ${totalTDP}W + 150W buffer)`,
        });
      }
    }

    // Case ↔ Mainboard: Check form factor compatibility
    if (selectedCase && selectedMainboard) {
      const caseFormFactor = selectedCase.formFactor
        ? String(selectedCase.formFactor).toUpperCase().replace(/\s/g, "")
        : "";
      const mbFormFactor = selectedMainboard.formFactor
        ? String(selectedMainboard.formFactor).toUpperCase().replace(/\s/g, "")
        : "";

      // ATX is standard, MicroATX fits in ATX case, but ATX doesn't fit in MicroATX
      if (caseFormFactor && mbFormFactor) {
        if (
          caseFormFactor.includes("MICROATX") &&
          mbFormFactor.includes("ATX")
        ) {
          warnings.push({
            type: "warning",
            message: `Case ${selectedCase.formFactor} có thể không lắp được Mainboard ${selectedMainboard.formFactor}`,
          });
        }
      }
    }

    return warnings;
  };

  // Check if there are critical compatibility errors
  const hasCompatibilityErrors = useCallback((warnings) => {
    return warnings.some((w) => w.type === "error");
  }, []);

  // Get compatibility warnings
  const compatibilityWarnings = checkCompatibility();

  // Handle add to cart
  const handleAddToCart = () => {
    if (
      !cpuId &&
      !mainboardId &&
      !ramId &&
      !gpuId &&
      !ssdId &&
      !psuId &&
      !caseId
    ) {
      toast.error("Vui lòng chọn ít nhất một linh kiện!");
      return;
    }

    if (hasCompatibilityErrors(compatibilityWarnings)) {
      toast.error(
        "Không thể thêm vào giỏ! Vui lòng sửa các lỗi tương thích màu đỏ trước.",
      );
      return;
    }

    const selectedItems = [];

    if (cpuId) {
      const cpu = getSelectedItem(cpus, cpuId);
      if (cpu) selectedItems.push(formatProductForCart(cpu));
    }
    if (mainboardId) {
      const mb = getSelectedItem(mainboards, mainboardId);
      if (mb) selectedItems.push(formatProductForCart(mb));
    }
    if (ramId) {
      const ram = getSelectedItem(rams, ramId);
      if (ram) selectedItems.push(formatProductForCart(ram));
    }
    if (gpuId) {
      const gpu = getSelectedItem(gpus, gpuId);
      if (gpu) selectedItems.push(formatProductForCart(gpu));
    }
    if (ssdId) {
      const ssd = getSelectedItem(ssds, ssdId);
      if (ssd) selectedItems.push(formatProductForCart(ssd));
    }
    if (psuId) {
      const psu = getSelectedItem(psus, psuId);
      if (psu) selectedItems.push(formatProductForCart(psu));
    }
    if (caseId) {
      const pcCase = getSelectedItem(cases, caseId);
      if (pcCase) selectedItems.push(formatProductForCart(pcCase));
    }

    selectedItems.forEach((item) => {
      addItem(item, 1);
    });

    toast.success(`Đã thêm ${selectedItems.length} linh kiện vào giỏ hàng!`);
  };

  // Handle buy now
  const handleBuyNow = () => {
    if (
      !cpuId &&
      !mainboardId &&
      !ramId &&
      !gpuId &&
      !ssdId &&
      !psuId &&
      !caseId
    ) {
      toast.error("Vui lòng chọn ít nhất một linh kiện!");
      return;
    }

    if (hasCompatibilityErrors(compatibilityWarnings)) {
      toast.error(
        "Không thể mua! Vui lòng sửa các lỗi tương thích màu đỏ trước.",
      );
      return;
    }

    const selectedItems = [];

    if (cpuId) {
      const cpu = getSelectedItem(cpus, cpuId);
      if (cpu) selectedItems.push(formatProductForCart(cpu));
    }
    if (mainboardId) {
      const mb = getSelectedItem(mainboards, mainboardId);
      if (mb) selectedItems.push(formatProductForCart(mb));
    }
    if (ramId) {
      const ram = getSelectedItem(rams, ramId);
      if (ram) selectedItems.push(formatProductForCart(ram));
    }
    if (gpuId) {
      const gpu = getSelectedItem(gpus, gpuId);
      if (gpu) selectedItems.push(formatProductForCart(gpu));
    }
    if (ssdId) {
      const ssd = getSelectedItem(ssds, ssdId);
      if (ssd) selectedItems.push(formatProductForCart(ssd));
    }
    if (psuId) {
      const psu = getSelectedItem(psus, psuId);
      if (psu) selectedItems.push(formatProductForCart(psu));
    }
    if (caseId) {
      const pcCase = getSelectedItem(cases, caseId);
      if (pcCase) selectedItems.push(formatProductForCart(pcCase));
    }

    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một linh kiện!");
      return;
    }

    // Lưu vào sessionStorage với format chuẩn cho Checkout
    sessionStorage.setItem(
      "buyNowProduct",
      JSON.stringify({
        items: selectedItems,
        total: totalPrice,
      }),
    );
    navigate("/checkout", {
      state: { directBuyItems: selectedItems, total: totalPrice },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Đang tải danh sách linh kiện...
          </p>
        </div>
      </div>
    );
  }

  // Get GPU info
  const gpuInfo = getGPUInfo();

  // Get other computed values
  const totalRAM = getTotalRAMCapacity();
  const ssdCapacity = getSSDCapacity();
  const psuWattage = getPSUWattage();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display font-black text-3xl text-slate-900 dark:text-white mb-2">
          🖥️ Build PC - Tự cấu hình máy tính
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Chọn các linh kiện phù hợp với nhu cầu của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* CPU */}
          <div className="card">
            <label className="block font-bold text-slate-800 dark:text-white mb-2">
              🧠 Chọn CPU (Bộ xử lý)
            </label>
            <select
              value={cpuId ?? ""}
              onChange={(e) =>
                setCpuId(e.target.value ? Number(e.target.value) : null)
              }
              className="input-field"
            >
              <option value="">-- Chọn CPU --</option>
              {cpus.map((cpu, index) => (
                <option
                  key={getProductId(cpu) ?? `cpu-${index}`}
                  value={getProductId(cpu)}
                >
                  {getProductName(cpu)} - {formatCurrency(getProductPrice(cpu))}
                </option>
              ))}
            </select>
          </div>

          {/* Mainboard */}
          <div className="card">
            <label className="block font-bold text-slate-800 dark:text-white mb-2">
              🔌 Chọn Mainboard (Bo mạch chủ)
            </label>
            <select
              value={mainboardId ?? ""}
              onChange={(e) =>
                setMainboardId(e.target.value ? Number(e.target.value) : null)
              }
              className="input-field"
            >
              <option value="">-- Chọn Mainboard --</option>
              {mainboards.map((mb, index) => (
                <option
                  key={getProductId(mb) ?? `mb-${index}`}
                  value={getProductId(mb)}
                >
                  {getProductName(mb)} - {formatCurrency(getProductPrice(mb))}
                </option>
              ))}
            </select>
          </div>

          {/* RAM */}
          <div className="card">
            <label className="block font-bold text-slate-800 dark:text-white mb-2">
              💾 Chọn RAM (Bộ nhớ)
            </label>
            <select
              value={ramId ?? ""}
              onChange={(e) =>
                setRamId(e.target.value ? Number(e.target.value) : null)
              }
              className="input-field"
            >
              <option value="">-- Chọn RAM --</option>
              {rams.map((ram, index) => (
                <option
                  key={getProductId(ram) ?? `ram-${index}`}
                  value={getProductId(ram)}
                >
                  {getProductName(ram)} - {formatCurrency(getProductPrice(ram))}
                </option>
              ))}
            </select>
          </div>

          {/* GPU */}
          <div className="card">
            <label className="block font-bold text-slate-800 dark:text-white mb-2">
              🎮 Chọn GPU (Card màn hình)
            </label>
            <select
              value={gpuId ?? ""}
              onChange={(e) =>
                setGpuId(e.target.value ? Number(e.target.value) : null)
              }
              className="input-field"
            >
              <option value="">-- Chọn GPU --</option>
              {gpus.map((gpu, index) => (
                <option
                  key={getProductId(gpu) ?? `gpu-${index}`}
                  value={getProductId(gpu)}
                >
                  {getProductName(gpu)} - {formatCurrency(getProductPrice(gpu))}
                </option>
              ))}
            </select>
          </div>

          {/* SSD */}
          <div className="card">
            <label className="block font-bold text-slate-800 dark:text-white mb-2">
              💿 Chọn SSD (Ổ cứng SSD)
            </label>
            <select
              value={ssdId ?? ""}
              onChange={(e) =>
                setSsdId(e.target.value ? Number(e.target.value) : null)
              }
              className="input-field"
            >
              <option value="">-- Chọn SSD --</option>
              {ssds.map((ssd, index) => (
                <option
                  key={getProductId(ssd) ?? `ssd-${index}`}
                  value={getProductId(ssd)}
                >
                  {getProductName(ssd)} - {formatCurrency(getProductPrice(ssd))}
                </option>
              ))}
            </select>
          </div>

          {/* PSU */}
          <div className="card">
            <label className="block font-bold text-slate-800 dark:text-white mb-2">
              ⚡ Chọn PSU (Nguồn máy tính)
            </label>
            <select
              value={psuId ?? ""}
              onChange={(e) =>
                setPsuId(e.target.value ? Number(e.target.value) : null)
              }
              className="input-field"
            >
              <option value="">-- Chọn PSU --</option>
              {psus.map((psu, index) => (
                <option
                  key={getProductId(psu) ?? `psu-${index}`}
                  value={getProductId(psu)}
                >
                  {getProductName(psu)} - {formatCurrency(getProductPrice(psu))}
                </option>
              ))}
            </select>
          </div>

          {/* Case */}
          <div className="card">
            <label className="block font-bold text-slate-800 dark:text-white mb-2">
              🏠 Chọn Case (Vỏ máy tính)
            </label>
            <select
              value={caseId ?? ""}
              onChange={(e) =>
                setCaseId(e.target.value ? Number(e.target.value) : null)
              }
              className="input-field"
            >
              <option value="">-- Chọn Case --</option>
              {cases.map((pcCase, index) => (
                <option
                  key={getProductId(pcCase) ?? `case-${index}`}
                  value={getProductId(pcCase)}
                >
                  {getProductName(pcCase)} -{" "}
                  {formatCurrency(getProductPrice(pcCase))}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right - Summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="card space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
              📋 Cấu hình của bạn
            </h2>

            <div className="space-y-3">
              {cpuId && <SelectedItemDisplay label="CPU" item={selectedCPU} />}
              {mainboardId && (
                <SelectedItemDisplay
                  label="Mainboard"
                  item={selectedMainboard}
                />
              )}
              {ramId && <SelectedItemDisplay label="RAM" item={selectedRAM} />}
              {gpuId && <SelectedItemDisplay label="GPU" item={selectedGPU} />}
              {ssdId && <SelectedItemDisplay label="SSD" item={selectedSSD} />}
              {psuId && <SelectedItemDisplay label="PSU" item={selectedPSU} />}
              {caseId && (
                <SelectedItemDisplay label="Case" item={selectedCase} />
              )}

              {!cpuId &&
                !mainboardId &&
                !ramId &&
                !gpuId &&
                !ssdId &&
                !psuId &&
                !caseId && (
                  <p className="text-slate-500 text-sm text-center py-4">
                    Chưa chọn linh kiện nào
                  </p>
                )}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 dark:text-white">
                  Tổng tiền:
                </span>
                <span className="font-extrabold text-blue-600 text-2xl">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </div>

            {/* Thông số kỹ thuật */}
            <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
              <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                💻 Thông số kỹ thuật
              </h3>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-3 text-sm">
                {/* CPU Specs */}
                {selectedCPU && (
                  <div className="space-y-2 pb-2 border-b border-slate-200 dark:border-slate-600">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      CPU - {getProductName(selectedCPU)}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {selectedCPU.socket && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Socket:</span>
                          <span className="font-medium">
                            {selectedCPU.socket}
                          </span>
                        </div>
                      )}
                      {selectedCPU.soNhan && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Số nhân:</span>
                          <span className="font-medium">
                            {selectedCPU.soNhan}
                          </span>
                        </div>
                      )}
                      {selectedCPU.soLuong && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Số luồng:</span>
                          <span className="font-medium">
                            {selectedCPU.soLuong}
                          </span>
                        </div>
                      )}
                      {selectedCPU.xungNhip && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Xung nhịp:</span>
                          <span className="font-medium">
                            {selectedCPU.xungNhip}
                          </span>
                        </div>
                      )}
                      {selectedCPU.tdp && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">TDP:</span>
                          <span className="font-medium">{selectedCPU.tdp}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Mainboard Specs */}
                {selectedMainboard && (
                  <div className="space-y-2 pb-2 border-b border-slate-200 dark:border-slate-600">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      Mainboard - {getProductName(selectedMainboard)}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {selectedMainboard.socket && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Socket:</span>
                          <span className="font-medium">
                            {selectedMainboard.socket}
                          </span>
                        </div>
                      )}
                      {selectedMainboard.chipset && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Chipset:</span>
                          <span className="font-medium">
                            {selectedMainboard.chipset}
                          </span>
                        </div>
                      )}
                      {selectedMainboard.ramType && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">RAM:</span>
                          <span className="font-medium">
                            {selectedMainboard.ramType}
                          </span>
                        </div>
                      )}
                      {selectedMainboard.ramSlots && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Khe RAM:</span>
                          <span className="font-medium">
                            {selectedMainboard.ramSlots}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* RAM Specs */}
                {selectedRAM && (
                  <div className="space-y-2 pb-2 border-b border-slate-200 dark:border-slate-600">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      RAM - {getProductName(selectedRAM)}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {totalRAM && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Dung lượng:</span>
                          <span className="font-medium">{totalRAM}</span>
                        </div>
                      )}
                      {selectedRAM.loaiRam && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Loại:</span>
                          <span className="font-medium">
                            {selectedRAM.loaiRam}
                          </span>
                        </div>
                      )}
                      {selectedRAM.tocDo && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tốc độ:</span>
                          <span className="font-medium">
                            {selectedRAM.tocDo}
                          </span>
                        </div>
                      )}
                      {selectedRAM.latency && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Latency:</span>
                          <span className="font-medium">
                            {selectedRAM.latency}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* GPU Specs */}
                {selectedGPU && (
                  <div className="space-y-2 pb-2 border-b border-slate-200 dark:border-slate-600">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      GPU - {getProductName(selectedGPU)}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {gpuInfo?.vram && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">VRAM:</span>
                          <span className="font-medium">{gpuInfo.vram}</span>
                        </div>
                      )}
                      {selectedGPU.chipset && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Chipset:</span>
                          <span className="font-medium">
                            {selectedGPU.chipset}
                          </span>
                        </div>
                      )}
                      {selectedGPU.coreClock && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Core Clock:</span>
                          <span className="font-medium">
                            {selectedGPU.coreClock}
                          </span>
                        </div>
                      )}
                      {selectedGPU.cudaCores && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Cores:</span>
                          <span className="font-medium">
                            {selectedGPU.cudaCores}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SSD Specs */}
                {selectedSSD && (
                  <div className="space-y-2 pb-2 border-b border-slate-200 dark:border-slate-600">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      SSD - {getProductName(selectedSSD)}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {ssdCapacity && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Dung lượng:</span>
                          <span className="font-medium">{ssdCapacity}</span>
                        </div>
                      )}
                      {selectedSSD.loai && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Loại:</span>
                          <span className="font-medium">
                            {selectedSSD.loai}
                          </span>
                        </div>
                      )}
                      {selectedSSD.docGhi && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Đọc/Ghi:</span>
                          <span className="font-medium">
                            {selectedSSD.docGhi}
                          </span>
                        </div>
                      )}
                      {selectedSSD.tocDoDoc && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tốc độ đọc:</span>
                          <span className="font-medium">
                            {selectedSSD.tocDoDoc}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* PSU Specs */}
                {selectedPSU && (
                  <div className="space-y-2 pb-2 border-b border-slate-200 dark:border-slate-600">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      PSU - {getProductName(selectedPSU)}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {psuWattage && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Công suất:</span>
                          <span className="font-medium">{psuWattage}</span>
                        </div>
                      )}
                      {selectedPSU.hieuSuat && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Hiệu suất:</span>
                          <span className="font-medium">
                            {selectedPSU.hieuSuat}
                          </span>
                        </div>
                      )}
                      {selectedPSU.chuan && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Chuẩn:</span>
                          <span className="font-medium">
                            {selectedPSU.chuan}
                          </span>
                        </div>
                      )}
                      {selectedPSU.modular && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Modular:</span>
                          <span className="font-medium">
                            {selectedPSU.modular}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Case Specs */}
                {selectedCase && (
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      Case - {getProductName(selectedCase)}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {selectedCase.formFactor && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Form Factor:</span>
                          <span className="font-medium">
                            {selectedCase.formFactor}
                          </span>
                        </div>
                      )}
                      {selectedCase.mauSac && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Màu sắc:</span>
                          <span className="font-medium">
                            {selectedCase.mauSac}
                          </span>
                        </div>
                      )}
                      {selectedCase.noiThat && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Nội thất:</span>
                          <span className="font-medium">
                            {selectedCase.noiThat}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!selectedCPU &&
                  !selectedMainboard &&
                  !selectedRAM &&
                  !selectedGPU &&
                  !selectedSSD &&
                  !selectedPSU &&
                  !selectedCase && (
                    <p className="text-slate-500 text-center py-2">
                      Chưa có thông số kỹ thuật
                    </p>
                  )}
              </div>
            </div>

            {/* Cảnh báo tương thích */}
            {compatibilityWarnings.length > 0 && (
              <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                <h3 className="font-bold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                  ⚠️ Linh kiện không tương thích
                </h3>
                <div className="space-y-2">
                  {compatibilityWarnings.map((warning, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg text-sm ${
                        warning.type === "error"
                          ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                          : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      {warning.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={
                    !cpuId &&
                    !mainboardId &&
                    !ramId &&
                    !gpuId &&
                    !ssdId &&
                    !psuId &&
                    !caseId
                  }
                  className="btn-secondary w-full py-3"
                >
                  🛒 Thêm vào giỏ
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={
                    !cpuId &&
                    !mainboardId &&
                    !ramId &&
                    !gpuId &&
                    !ssdId &&
                    !psuId &&
                    !caseId
                  }
                  className="btn-primary w-full py-3"
                >
                  ⚡ Mua ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectedItemDisplay({ label, item }) {
  if (!item) return null;

  return (
    <div className="flex justify-between items-start text-sm">
      <span className="text-slate-600 dark:text-slate-400">{label}:</span>
      <div className="text-right max-w-[60%]">
        <p className="font-semibold text-slate-800 dark:text-white line-clamp-1">
          {getProductName(item)}
        </p>
        <p className="text-blue-600 dark:text-blue-400 font-bold">
          {formatCurrency(getProductPrice(item))}
        </p>
      </div>
    </div>
  );
}
