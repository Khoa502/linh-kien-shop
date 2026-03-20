using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackendAPI.Migrations
{
    /// <inheritdoc />
    public partial class Remove_PhieuThuNo_TraHang : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PhieuThuNo");

            migrationBuilder.DropTable(
                name: "PhieuTraHang");

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "TaiKhoan",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ThoiHanBaoHanh",
                table: "SanPham",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Email",
                table: "TaiKhoan");

            migrationBuilder.DropColumn(
                name: "ThoiHanBaoHanh",
                table: "SanPham");

            migrationBuilder.CreateTable(
                name: "PhieuThuNo",
                columns: table => new
                {
                    MaPTN = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaHD = table.Column<int>(type: "int", nullable: true),
                    MaKH = table.Column<int>(type: "int", nullable: true),
                    MaNV = table.Column<int>(type: "int", nullable: true),
                    GhiChu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayThu = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SoTienThu = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhieuThuNo", x => x.MaPTN);
                    table.ForeignKey(
                        name: "FK_PhieuThuNo_HoaDon_MaHD",
                        column: x => x.MaHD,
                        principalTable: "HoaDon",
                        principalColumn: "MaHD",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PhieuThuNo_KhachHang_MaKH",
                        column: x => x.MaKH,
                        principalTable: "KhachHang",
                        principalColumn: "MaKH",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PhieuThuNo_NhanVien_MaNV",
                        column: x => x.MaNV,
                        principalTable: "NhanVien",
                        principalColumn: "MaNV",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PhieuTraHang",
                columns: table => new
                {
                    MaPTH = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaHD = table.Column<int>(type: "int", nullable: true),
                    MaNV = table.Column<int>(type: "int", nullable: true),
                    LyDoTra = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayTra = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TongTienHoan = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TrangThai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhieuTraHang", x => x.MaPTH);
                    table.ForeignKey(
                        name: "FK_PhieuTraHang_HoaDon_MaHD",
                        column: x => x.MaHD,
                        principalTable: "HoaDon",
                        principalColumn: "MaHD",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PhieuTraHang_NhanVien_MaNV",
                        column: x => x.MaNV,
                        principalTable: "NhanVien",
                        principalColumn: "MaNV",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PhieuThuNo_MaHD",
                table: "PhieuThuNo",
                column: "MaHD");

            migrationBuilder.CreateIndex(
                name: "IX_PhieuThuNo_MaKH",
                table: "PhieuThuNo",
                column: "MaKH");

            migrationBuilder.CreateIndex(
                name: "IX_PhieuThuNo_MaNV",
                table: "PhieuThuNo",
                column: "MaNV");

            migrationBuilder.CreateIndex(
                name: "IX_PhieuTraHang_MaHD",
                table: "PhieuTraHang",
                column: "MaHD");

            migrationBuilder.CreateIndex(
                name: "IX_PhieuTraHang_MaNV",
                table: "PhieuTraHang",
                column: "MaNV");
        }
    }
}
