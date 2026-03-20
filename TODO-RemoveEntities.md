# TODO: Remove PhieuThuNo & PhieuTraHang - Progress Tracker

## Approved Plan Steps:

1. [ ] Create this TODO.md ✅ **DONE**
2. [✅] Delete 6 physical files (Controllers, DTOs, Models)
3. [✅] Edit Models: HoaDon.cs, KhachHang.cs, NhanVien.cs (remove nav props)
4. [✅] Edit ApplicationDbContext.cs (remove DbSets & Fluent API)
5. [✅] Edit MappingProfile.cs (remove AutoMapper configs)
6. [✅] Verify build: `dotnet build` (succeeded with warnings - unrelated nullable)
7. [ ] Generate EF migration: `dotnet ef migrations add RemovePhieuThuNoPhieuTraHang`
8. [ ] Update database: `dotnet ef database update`
9. [ ] Test key endpoints (HoaDon, KhachHang, etc.)
10. [ ] Mark complete & attempt_completion

**Current step: 1/10**
