import { useState, useRef, useEffect } from "react";
import { productSearchService } from "../services/productSearchService.js";
import { useNavigate } from "react-router-dom";
import { productService } from "../services/productService.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import ProductCard from "./ProductCard.jsx";

const RULES = [
  [
    /cpu|vi xử lý|processor/i,
    "TechStore có CPU Intel Core i3~i9 và AMD Ryzen đầy đủ. Bạn cần cấu hình hay budget bao nhiêu?",
  ],
  [
    /ram|bộ nhớ trong/i,
    "RAM DDR4 8~64GB và DDR5 đang có sẵn. Bạn cần bao nhiêu GB?",
  ],
  [
    /vga|card màn hình|rtx|gtx|gpu/i,
    "Card đồ họa từ GTX 1650 đến RTX 4090 đều có. Budget bạn là bao nhiêu?",
  ],
  [
    /ssd|hdd|nvme|ổ cứng|lưu trữ/i,
    "SSD NVMe và SATA 256GB~4TB đang giảm giá tốt. Cần dung lượng bao nhiêu?",
  ],
  [
    /main|bo mạch|mainboard|motherboard/i,
    "Mainboard Intel và AMD nhiều tầm giá. Bạn dùng CPU socket gì?",
  ],
  [
    /màn hình|monitor|display/i,
    'Màn hình 21"~32", 60~360Hz. Dùng để gaming hay làm việc?',
  ],
  [
    /case|thùng máy/i,
    "Case nhiều loại từ mini-ITX đến full-tower. Bạn cần cỡ nào?",
  ],
  [
    /psu|nguồn|power supply/i,
    "Nguồn máy tính từ 450W~1000W, 80+ Bronze/Gold/Platinum. Công suất cần?",
  ],
  [
    /tản nhiệt|cooling|fan/i,
    "Tản nhiệt khí và tản nhiệt nước (AIO) đều có. CPU bạn dùng loại gì?",
  ],
  [
    /bàn phím|keyboard/i,
    "Bàn phím cơ, membrane, wireless nhiều switch. Bạn thích gì?",
  ],
  [
    /chuột|mouse/i,
    "Chuột gaming DPI cao và chuột văn phòng ergonomic đủ loại.",
  ],
  [
    /bảo hành|warranty/i,
    "Tất cả sản phẩm bảo hành chính hãng 12~36 tháng tại TechStore.",
  ],
  [
    /giá|bao nhiêu|price|cost/i,
    "Xem giá chi tiết tại trang Sản Phẩm, hoặc cho biết linh kiện cụ thể nhé!",
  ],
  [
    /giao hàng|ship|vận chuyển/i,
    "Giao hàng toàn quốc 2~5 ngày. Nội thành HCM & HN giao trong ngày.",
  ],
  [
    /trả hàng|đổi hàng|return/i,
    "Hỗ trợ đổi trả trong 7 ngày nếu lỗi do nhà sản xuất.",
  ],
  [
    /build pc|xây dựng pc|cấu hình/i,
    "Tôi có thể tư vấn cấu hình PC! Cho biết mục đích dùng (gaming/đồ họa/văn phòng) và ngân sách?",
  ],
  [
    /xin chào|hello|hi|chào/i,
    "Xin chào! 👋 Tôi là TechBot, trợ lý tư vấn linh kiện. Bạn cần giúp gì?",
  ],
  [
    /cảm ơn|thanks|thank/i,
    "Không có gì! Nếu cần thêm tư vấn, cứ hỏi tôi nhé 😊",
  ],
];

function parseProductQuery(msg) {
  const lower = msg.toLowerCase();
  const categories = {
    ram: "ram",
    ssd: "ssd",
    cpu: "cpu",
    gpu: "gpu",
    "màn hình": "màn hình",
    chuột: "chuột",
    "bàn phím": "bàn phím",
    "card màn hình": "vga",
    pc: "pc gaming",
  };

  for (const [key, keyword] of Object.entries(categories)) {
    if (lower.includes(key)) {
      const capacityMatch = lower.match(
        /(8|16|32|64)gb|256gb|512gb|1tb|2tb|500gb/i,
      );
      const capacity = capacityMatch ? capacityMatch[0].toLowerCase() : null;
      const budgetMatch = lower.match(/(\\d+(?:\\.\\d+)?)\\s*trieu/i);
      const budget = budgetMatch
        ? parseInt(budgetMatch[1].replace(".", "")) * 1000000
        : null;

      return { keyword, filters: { capacity, budget } };
    }
  }
  return null;
}

function getReply(msg) {
  for (const [pattern, reply] of RULES) {
    if (pattern.test(msg)) return reply;
  }
  return "Cảm ơn bạn đã nhắn tin! Tôi chuyên tư vấn linh kiện máy tính. Hãy cho biết bạn cần tư vấn gì? 😊";
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    {
      from: "bot",
      text: 'Xin chào! 👋 Tôi là TechBot - trợ lý tư vấn linh kiện máy tính 24/7. Gõ "ram 16gb" để tìm sản phẩm nhé!',
    },
  ]);
  const [chatProducts, setChatProducts] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  const navigate = useNavigate();

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    setMsgs((prev) => [...prev, { from: "user", text: msg }]);
    setLoading(true);

    const query = parseProductQuery(msg);
    if (query) {
      try {
        // Backend search with fallback (upgraded from client-side filter)
        const searchProducts = await productSearchService.search(query.keyword);

        // Apply existing filters on search results
        let filtered = [...searchProducts];
        if (query.filters.capacity) {
          filtered = filtered.filter((p) =>
            p.tenSP
              .toLowerCase()
              .includes(query.filters.capacity.replace("gb", "")),
          );
        }
        if (query.filters.budget) {
          filtered = filtered.filter((p) => p.giaBan <= query.filters.budget);
        }

        if (filtered.length > 0) {
          setMsgs((prev) => [
            ...prev,
            {
              from: "bot",
              type: "products",
              products: filtered.slice(0, 4), // max 4 cards
              text: `Tìm thấy ${filtered.length} sản phẩm ${query.keyword.toUpperCase()}:`,
            },
          ]);
        } else {
          setMsgs((prev) => [
            ...prev,
            {
              from: "bot",
              text: "Không tìm thấy sản phẩm phù hợp với yêu cầu của bạn.",
            },
          ]);
        }
      } catch (error) {
        setMsgs((prev) => [
          ...prev,
          {
            from: "bot",
            text: "Có lỗi khi tìm sản phẩm. Thử lại nhé!",
          },
        ]);
      }
    } else {
      // Fallback to rules
      setTimeout(() => {
        setMsgs((prev) => [...prev, { from: "bot", text: getReply(msg) }]);
      }, 800);
    }

    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-600 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                🤖
              </div>
              <div>
                <p className="text-white font-bold text-sm">TechBot</p>
                <p className="text-blue-200 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>
                  Đang hoạt động
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white text-xl leading-none"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900/50">
            {msgs.map((m, i) => {
              if (m.type === "products") {
                return (
                  <div key={i} className="flex justify-start space-y-2">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-1">
                      🤖
                    </div>
                    <div className="max-w-[78%] space-y-2">
                      <div className="bg-white dark:bg-slate-700 px-3 py-2 rounded-2xl text-sm shadow-sm rounded-bl-sm">
                        {m.text}
                      </div>
                      <div className="grid grid-cols-2 gap-2 px-2">
                        {m.products.map((product) => (
                          <div
                            key={product.maSP}
                            className="bg-white dark:bg-slate-700 rounded-xl p-2 shadow-sm border border-slate-200 dark:border-slate-600"
                          >
                            <img
                              src={
                                product.hinhAnh ||
                                `https://placehold.co/120x80/${Math.floor(Math.random() * 16777215).toString(16)}/ffffff?text=${encodeURIComponent(product.tenSP.slice(0, 10))}`
                              }
                              alt={product.tenSP}
                              className="w-full h-20 object-cover rounded-lg mb-1"
                            />
                            <p className="text-xs font-semibold line-clamp-2 dark:text-slate-200">
                              {product.tenSP}
                            </p>
                            <p className="text-xs font-bold text-blue-600 mt-1">
                              {formatCurrency(product.giaBan)}
                            </p>
                            <button
                              onClick={() =>
                                navigate(`/products/${product.maSP}`)
                              }
                              className="w-full mt-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Xem sản phẩm
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={i}
                  className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.from === "bot" && (
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-1">
                      🤖
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed
                    ${
                      m.from === "user"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-xs mr-2 flex-shrink-0">
                  🤖
                </div>
                <div className="bg-white dark:bg-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          {msgs.length <= 2 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 bg-slate-50 dark:bg-slate-900/50">
              {["CPU Intel", "RAM DDR5", "Card RTX", "Tư vấn Build PC"].map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setInput(s);
                    }}
                    className="text-xs px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors"
                  >
                    {s}
                  </button>
                ),
              )}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-slate-100 dark:border-slate-700 p-3 flex gap-2 bg-white dark:bg-slate-800">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Nhập câu hỏi về linh kiện..."
              className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 transition-colors flex-shrink-0"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center text-2xl relative"
      >
        {open ? "✕" : "💬"}
        {!open && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white"></span>
        )}
      </button>
    </div>
  );
}
