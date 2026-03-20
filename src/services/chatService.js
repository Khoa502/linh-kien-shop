import axiosInstance from './axiosInstance'

// ChatHoiThoai fields từ API:
// { id, maKH, tenKH, ngayBatDau, trangThai, soTinNhan }

export const chatHoiThoaiService = {
  // GET /api/ChatHoiThoai
  getAll: () => axiosInstance.get('/ChatHoiThoai'),

  // POST /api/ChatHoiThoai — tạo cuộc hội thoại mới
  create: (data) => axiosInstance.post('/ChatHoiThoai', data),

  // PUT /api/ChatHoiThoai/{id}
  update: (id, data) => axiosInstance.put(`/ChatHoiThoai/${id}`, data),
}

// ChatTinNhan fields từ API:
// { id, chatID, nguoiGui, noiDung, thoiGian }
// nguoiGui: "Khách hàng" hoặc "Nhân viên"

export const chatTinNhanService = {
  // GET /api/ChatTinNhan
  getAll: () => axiosInstance.get('/ChatTinNhan'),

  // POST /api/ChatTinNhan — gửi tin nhắn
  send: (data) =>
    axiosInstance.post('/ChatTinNhan', {
      chatID: data.chatID,
      nguoiGui: data.nguoiGui, // "Khách hàng" | "Nhân viên"
      noiDung: data.noiDung,
      thoiGian: new Date().toISOString(),
    }),
}
