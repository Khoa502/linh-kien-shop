-- Add missing columns to LichSuDangNhap table for login history
-- Run this SQL script in SQL Server Management Studio or equivalent

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.LichSuDangNhap') AND name = 'Browser')
BEGIN
    ALTER TABLE dbo.LichSuDangNhap 
    ADD Browser NVARCHAR(50) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.LichSuDangNhap') AND name = 'Device')
BEGIN
    ALTER TABLE dbo.LichSuDangNhap 
    ADD Device NVARCHAR(100) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.LichSuDangNhap') AND name = 'OS')
BEGIN
    ALTER TABLE dbo.LichSuDangNhap 
    ADD [OS] NVARCHAR(50) NULL;
END

PRINT '✅ Added missing columns Browser, Device, OS to LichSuDangNhap table (if they didn''t exist)';

