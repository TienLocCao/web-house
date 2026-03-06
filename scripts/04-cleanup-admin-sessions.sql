CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_admin_sessions_expires_at 
ON admin_sessions (expires_at);

CREATE OR REPLACE PROCEDURE sp_cleanup_bulk_sessions()
LANGUAGE plpgsql
AS $$DECLARE
    deleted_count INT;
    total_deleted INT := 0;
BEGIN
    LOOP
        WITH deleted_rows AS (
            DELETE FROM admin_sessions
            WHERE id IN (
                SELECT id FROM admin_sessions 
                WHERE expires_at < NOW() 
                LIMIT 5000 -- Xóa từng cục 5k dữ liệu
            )
            RETURNING id
        )
        SELECT COUNT(*) INTO deleted_count FROM deleted_rows;
        
        total_deleted := total_deleted + deleted_count;
        
        COMMIT; -- Quan trọng: Giải phóng lock và WAL cho NeonDB
        
        -- Thoát vòng lặp nếu không còn gì để xóa
        EXIT WHEN deleted_count = 0;
    END LOOP;
    
    RAISE NOTICE 'Đã dọn dẹp thành công tổng cộng: % sessions', total_deleted;
END;$$;


-- Gọi thủ tục vừa tạo (Có thể mất vài phút nếu dữ liệu lớn)
CALL sp_cleanup_bulk_sessions();

-- Trả lại dung lượng ổ cứng vật lý cho NeonDB và update lại statistics cho bảng
VACUUM ANALYZE admin_sessions;
