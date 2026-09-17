import React from 'react';
import './Pagination.css';

export const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50],
  itemLabel = 'records',
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(validCurrentPage * pageSize, totalItems);

  if (totalItems === 0) return null;

  return (
    <div className="directory-pagination-bar">
      <div className="directory-pagination-left">
        <span>Rows per page:</span>
        <div className="directory-rows-select-wrap">
          <select
            className="directory-rows-select"
            value={pageSize}
            onChange={(e) => {
              if (onPageSizeChange) {
                onPageSizeChange(Number(e.target.value));
              }
              if (onPageChange) {
                onPageChange(1);
              }
            }}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <span className="directory-items-range">
          Showing <strong>{startItem}</strong> - <strong>{endItem}</strong> of <strong>{totalItems}</strong> {itemLabel}
        </span>
      </div>

      <div className="directory-pagination-center">
        Page <strong>{validCurrentPage}</strong> of <strong>{totalPages}</strong>
      </div>

      <div className="directory-pagination-right">
        <button
          type="button"
          className="directory-page-btn-prev"
          disabled={validCurrentPage <= 1}
          onClick={() => onPageChange && onPageChange(Math.max(1, validCurrentPage - 1))}
        >
          Previous
        </button>

        {totalPages <= 7 ? (
          Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              type="button"
              className={`directory-page-btn-num ${num === validCurrentPage ? 'active' : ''}`}
              onClick={() => onPageChange && onPageChange(num)}
            >
              {num}
            </button>
          ))
        ) : (
          <>
            <button
              type="button"
              className={`directory-page-btn-num ${validCurrentPage === 1 ? 'active' : ''}`}
              onClick={() => onPageChange && onPageChange(1)}
            >
              1
            </button>
            {validCurrentPage > 3 && <span className="pagination-ellipsis">...</span>}
            {validCurrentPage > 2 && validCurrentPage < totalPages - 1 && (
              <button
                type="button"
                className="directory-page-btn-num active"
                onClick={() => onPageChange && onPageChange(validCurrentPage)}
              >
                {validCurrentPage}
              </button>
            )}
            {validCurrentPage < totalPages - 2 && <span className="pagination-ellipsis">...</span>}
            <button
              type="button"
              className={`directory-page-btn-num ${validCurrentPage === totalPages ? 'active' : ''}`}
              onClick={() => onPageChange && onPageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          className="directory-page-btn-next"
          disabled={validCurrentPage >= totalPages}
          onClick={() => onPageChange && onPageChange(Math.min(totalPages, validCurrentPage + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
};
