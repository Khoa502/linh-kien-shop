/**
 * Hàm parse JSON an toàn - tránh lỗi "undefined is not valid JSON"
 * @param {any} data - Dữ liệu cần parse
 * @param {any} defaultValue - Giá trị mặc định nếu parse thất bại (default: null)
 * @returns {any} - Dữ liệu đã parse hoặc giá trị mặc định
 */
export const safeJsonParse = (data, defaultValue = null) => {
  // Kiểm tra các giá trị không hợp lệ
  if (data === undefined || data === null) {
    return defaultValue;
  }

  // Kiểm tra nếu data là chuỗi "undefined" hoặc "null" (string literal)
  if (typeof data === "string") {
    const trimmed = data.trim();
    if (trimmed === "undefined" || trimmed === "null" || trimmed === "") {
      return defaultValue;
    }
  }

  // Nếu data đã là object (không cần parse), trả về trực tiếp
  if (typeof data === "object" && data !== null) {
    return data;
  }

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Lỗi parse JSON:", error, "Data:", data);
    return defaultValue;
  }
};

/**
 * Hàm lấy dữ liệu từ localStorage và parse an toàn
 * @param {string} key - Key trong localStorage
 * @param {any} defaultValue - Giá trị mặc định nếu không tìm thấy
 * @returns {any} - Dữ liệu đã parse hoặc giá trị mặc định
 */
export const safeGetLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return safeJsonParse(item, defaultValue);
  } catch (error) {
    console.error("Lỗi đọc localStorage:", error);
    return defaultValue;
  }
};

/**
 * Hàm lấy dữ liệu từ sessionStorage và parse an toàn
 * @param {string} key - Key trong sessionStorage
 * @param {any} defaultValue - Giá trị mặc định nếu không tìm thấy
 * @returns {any} - Dữ liệu đã parse hoặc giá trị mặc định
 */
export const safeGetSessionStorage = (key, defaultValue = null) => {
  try {
    const item = sessionStorage.getItem(key);
    return safeJsonParse(item, defaultValue);
  } catch (error) {
    console.error("Lỗi đọc sessionStorage:", error);
    return defaultValue;
  }
};
