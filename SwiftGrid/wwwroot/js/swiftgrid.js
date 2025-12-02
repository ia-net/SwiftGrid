// SwiftGrid JavaScript Module
// SwiftGrid - Blazor wrapper for Tabulator
// Version: 1.0.0
window.swiftGrid = (function () {
    'use strict';
    
    // ============================================
    // Constants
    // ============================================
    
    const MODULE_NAME = 'SwiftGrid';
    const DEFAULT_LAYOUT = 'fitColumns';
    const DEFAULT_PAGINATION_MODE = 'local';
    const DEFAULT_PAGINATION_COUNTER = 'rows';
    const SUPPORTED_DOWNLOAD_TYPES = ['csv', 'json', 'xlsx', 'pdf', 'html'];
    
    // ============================================
    // Module State
    // ============================================
    
    const tables = new Map();

    // ============================================
    // Utility Functions
    // ============================================

    /**
     * 로그 레벨에 따라 콘솔에 메시지를 출력합니다.
     * @param {string} level - 로그 레벨 ('error', 'warn', 'info', 'debug')
     * @param {string} message - 로그 메시지
     * @param {any} [data] - 추가 데이터
     */
    function log(level, message, data) {
        const prefix = `[${MODULE_NAME}]`;
        const fullMessage = `${prefix} ${message}`;

        if (!console || typeof console[level] !== 'function') {
            return;
        }

        if (data !== undefined) {
            console[level](fullMessage, data);
        } else {
            console[level](fullMessage);
        }
    }

    /**
     * 요소의 고유 키를 가져옵니다.
     * @param {Element|string} element - DOM 요소 또는 요소 참조
     * @returns {string|Element} 요소의 ID 또는 요소 자체
     */
    function getKey(element) {
        if (!element) {
            return null;
        }
        return element.id || element;
    }

    /**
     * C# 객체의 속성을 camelCase로 변환합니다.
     * PascalCase와 camelCase 모두 지원합니다.
     * @param {any} obj - 변환할 객체
     * @param {string} camelKey - camelCase 키
     * @param {string} pascalKey - PascalCase 키
     * @param {any} defaultValue - 기본값
     * @returns {any} 변환된 값
     */
    function getProperty(obj, camelKey, pascalKey, defaultValue) {
        if (obj?.[camelKey] !== undefined) return obj[camelKey];
        if (obj?.[pascalKey] !== undefined) return obj[pascalKey];
        return defaultValue;
    }

    /**
     * 컬럼 정의를 Tabulator 형식으로 변환합니다.
     * @param {Array} columns - C#에서 전달된 컬럼 정의 배열
     * @returns {Array} Tabulator 컬럼 정의 배열
     */
    function convertColumns(columns) {
        if (!columns?.length) return [];

        return columns.map(col => {
            const sortable = getProperty(col, 'sortable', 'Sortable', false);
            const visible = getProperty(col, 'visible', 'Visible', true);
            const rawField = getProperty(col, 'field', 'Field', '');
            
            // PascalCase를 camelCase로 변환 (Id -> id)
            const normalizedField = rawField && typeof rawField === 'string'
                ? rawField.charAt(0).toLowerCase() + rawField.slice(1)
                : rawField;

            const tabCol = {
                field: normalizedField,
                title: getProperty(col, 'title', 'Title', ''),
                headerSort: sortable,
                visible: visible
            };

            const width = getProperty(col, 'width', 'Width', null);
            if (width !== null) tabCol.width = width;

            const formatter = getProperty(col, 'formatter', 'Formatter', null);
            if (formatter) tabCol.formatter = formatter;

            // 헤더 필터 옵션 추가
            const headerFilter = getProperty(col, 'headerFilter', 'HeaderFilter', null);
            if (headerFilter !== null && headerFilter !== undefined) {
                tabCol.headerFilter = headerFilter === true ? "input" : headerFilter;
            }

            const headerFilterPlaceholder = getProperty(col, 'headerFilterPlaceholder', 'HeaderFilterPlaceholder', null);
            if (headerFilterPlaceholder !== null && headerFilterPlaceholder !== undefined) {
                tabCol.headerFilterPlaceholder = headerFilterPlaceholder;
            }

            const headerFilterParams = getProperty(col, 'headerFilterParams', 'HeaderFilterParams', null);
            if (headerFilterParams !== null && headerFilterParams !== undefined) {
                tabCol.headerFilterParams = headerFilterParams;
            }

            // 편집 옵션 추가
            const editable = getProperty(col, 'editable', 'Editable', null);
            if (editable !== null && editable !== undefined) {
                tabCol.editable = editable === true ? true : editable;
            }

            const editor = getProperty(col, 'editor', 'Editor', null);
            if (editor !== null && editor !== undefined) {
                tabCol.editor = editor;
            }

            const editorParams = getProperty(col, 'editorParams', 'EditorParams', null);
            if (editorParams !== null && editorParams !== undefined) {
                tabCol.editorParams = editorParams;
            }

            // 추가 속성 동적 복사
            Object.keys(col).forEach(key => {
                const lowerKey = key.toLowerCase();
                if (!['field', 'title', 'sortable', 'visible', 'width', 'formatter', 
                       'headerfilter', 'headerfilterplaceholder', 'headerfilterparams',
                       'editable', 'editor', 'editorparams'].includes(lowerKey) &&
                    !tabCol.hasOwnProperty(key)) {
                    tabCol[key] = col[key];
                }
            });

            return tabCol;
        });
    }

    /**
     * 옵션을 Tabulator 형식으로 변환합니다.
     * @param {any} options - C#에서 전달된 옵션 객체
     * @returns {object} Tabulator 옵션 객체
     */
    /**
     * C# 옵션 객체를 Tabulator 형식으로 변환합니다.
     * @param {any} options - C#에서 전달된 옵션 객체
     * @param {DotNetObjectReference} dotNetRef - .NET 객체 참조
     * @returns {object} Tabulator 옵션 객체
     */
    function convertOptions(options, dotNetRef) {
        const tabOptions = {
            layout: getProperty(options, 'layout', 'Layout', DEFAULT_LAYOUT),
            height: getProperty(options, 'height', 'Height', null),
            selectable: getProperty(options, 'selectable', 'Selectable', 1),
            rowClick: (e, row) => {
                if (dotNetRef) {
                    try {
                        const rowData = row.getData();
                        dotNetRef.invokeMethodAsync('HandleRowClicked', rowData).catch(err => {
                            log('error', 'Error invoking row click callback', err);
                        });
                    } catch (error) {
                        log('error', 'Error in row click handler', error);
                    }
                }
            }
        };

        // 페이지네이션 옵션 추가
        const pagination = getProperty(options, 'pagination', 'Pagination', false);
        if (pagination) {
            tabOptions.pagination = pagination === true ? DEFAULT_PAGINATION_MODE : pagination;
            
            const paginationSize = getProperty(options, 'paginationSize', 'PaginationSize', null);
            if (paginationSize !== null) {
                tabOptions.paginationSize = paginationSize;
            }
            
            const paginationMode = getProperty(options, 'paginationMode', 'PaginationMode', null);
            if (paginationMode !== null) {
                tabOptions.paginationMode = paginationMode;
            }
            
            // paginationCounter: boolean일 경우 "rows"로 변환, false는 그대로 유지
            const paginationCounter = getProperty(options, 'paginationCounter', 'PaginationCounter', null);
            if (paginationCounter !== null && paginationCounter !== false) {
                // true이거나 다른 값이면 문자열로 변환, "rows" 또는 "pages" 또는 함수
                if (paginationCounter === true) {
                    tabOptions.paginationCounter = DEFAULT_PAGINATION_COUNTER;
                } else {
                    tabOptions.paginationCounter = paginationCounter;
                }
            } else if (paginationCounter === false) {
                tabOptions.paginationCounter = false;
            }
            
            // paginationSizeSelector: boolean일 경우 true로 유지 (Tabulator가 배열이나 true를 기대)
            const paginationSizeSelector = getProperty(options, 'paginationSizeSelector', 'PaginationSizeSelector', null);
            if (paginationSizeSelector !== null) {
                // true일 경우 기본값 사용, 배열이나 숫자 배열이면 그대로 전달
                tabOptions.paginationSizeSelector = paginationSizeSelector;
            }
            
            const paginationButtonCount = getProperty(options, 'paginationButtonCount', 'PaginationButtonCount', null);
            if (paginationButtonCount !== null) {
                tabOptions.paginationButtonCount = paginationButtonCount;
            }
        }

        // 히스토리(undo/redo) 옵션 추가
        const history = getProperty(options, 'history', 'History', false);
        if (history !== null && history !== undefined) {
            tabOptions.history = history;
        }

        // 편집 트리거 이벤트 옵션 추가
        const editTriggerEvent = getProperty(options, 'editTriggerEvent', 'EditTriggerEvent', null);
        if (editTriggerEvent !== null && editTriggerEvent !== undefined) {
            tabOptions.editTriggerEvent = editTriggerEvent;
        }

        // 클립보드 옵션 추가
        const clipboard = getProperty(options, 'clipboard', 'Clipboard', null);
        if (clipboard !== null && clipboard !== undefined) {
            tabOptions.clipboard = clipboard;
        }

        const clipboardCopyRowRange = getProperty(options, 'clipboardCopyRowRange', 'ClipboardCopyRowRange', 'selected');
        // 기본값을 "selected"로 설정 - 선택된 행만 복사
        tabOptions.clipboardCopyRowRange = clipboardCopyRowRange || 'selected';

        // 셀 편집 완료 이벤트 핸들러 추가
        if (dotNetRef) {
            tabOptions.cellEdited = function(cell) {
                if (dotNetRef) {
                    try {
                        const cellComponent = typeof cell.getComponent === 'function' ? cell.getComponent() : cell;
                        const cellData = {
                            field: cellComponent.getField(),
                            value: cellComponent.getValue(),
                            oldValue: typeof cellComponent.getOldValue === 'function' ? cellComponent.getOldValue() : null,
                            row: cellComponent.getRow().getData()
                        };
                        dotNetRef.invokeMethodAsync('HandleCellEdited', cellData).catch(err => {
                            log('error', 'Error invoking cell edited callback', err);
                        });
                    } catch (error) {
                        log('error', 'Error in cell edited handler', error);
                    }
                }
            };
        }

        return tabOptions;
    }

    /**
     * Tabulator 테이블을 초기화합니다.
     * @param {Element} element - 테이블을 생성할 DOM 요소
     * @param {DotNetObjectReference} dotNetRef - .NET 객체 참조
     * @param {object} options - 그리드 옵션
     * @param {Array} data - 테이블 데이터
     * @param {Array} columns - 컬럼 정의
     */
    function initTable(element, dotNetRef, options, data, columns) {
        if (!element) {
            log('error', 'Invalid element provided for table initialization');
            throw new Error('Invalid element provided for table initialization');
        }

        const key = getKey(element);
        if (key && tables.has(key)) {
            log('warn', `Table with key '${key}' already exists. Destroying existing table.`);
            destroyTable(element);
        }

        let convertedColumns = convertColumns(columns);
        const tableData = Array.isArray(data) ? data : [];

        // 체크박스 선택 활성화 옵션 확인
        const enableCheckbox = getProperty(options, 'enableRowSelectionCheckbox', 'EnableRowSelectionCheckbox', false);
        if (enableCheckbox) {
            // 전체 선택 체크박스의 선택 범위 설정
            const rowSelectionRange = getProperty(options, 'rowSelectionRange', 'RowSelectionRange', 'active');
            const finalRange = rowSelectionRange || "active"; // 기본값: 현재 페이지의 행만 선택
            
            // 체크박스 컬럼을 첫 번째에 추가
            // titleFormatterParams는 헤더 체크박스에, formatterParams는 행 체크박스에 사용됨
            const checkboxColumn = {
                formatter: "rowSelection",
                titleFormatter: "rowSelection",
                formatterParams: {
                    rowRange: finalRange
                },
                titleFormatterParams: {
                    rowRange: finalRange  // 헤더 체크박스용 파라미터
                },
                // 셀 클릭 시 체크박스 토글 (체크박스 자체가 아닌 셀을 클릭했을 때)
                cellClick: function(e, cell) {
                    // 체크박스 자체를 클릭한 경우는 이미 처리되므로 무시
                    if (e.target && (e.target.type === 'checkbox' || e.target.closest('input[type="checkbox"]'))) {
                        return;
                    }
                    // 셀의 다른 부분을 클릭한 경우 행 선택 토글
                    const row = cell.getRow();
                    if (row) {
                        row.toggleSelect();
                    }
                },
                headerSort: false,
                hozAlign: "center",
                width: 50,
                frozen: true,
                resizable: false
            };
            convertedColumns = [checkboxColumn, ...convertedColumns];
            log('debug', 'Row selection checkbox column added', { rowRange: finalRange });
        }

        log('debug', 'Initializing table', {
            key: key,
            dataCount: tableData.length,
            columnsCount: convertedColumns.length,
            hasData: tableData.length > 0,
            checkboxEnabled: enableCheckbox
        });

        if (!window.Tabulator) {
            log('error', 'Tabulator library is not loaded. Make sure tabulator.min.js is included before swiftgrid.js');
            throw new Error('Tabulator library is not loaded');
        }

        try {
            const tabulatorOptions = {
                data: tableData,
                columns: convertedColumns,
                ...convertOptions(options, dotNetRef)
            };

            const table = new Tabulator(element, tabulatorOptions);
            
            // 클립보드 복사 동작 커스터마이징: 선택된 행이 없을 때만 fallback 사용
            // 테이블이 완전히 초기화된 후 이벤트 리스너 추가
            table.on("tableBuilt", function() {
                if (table.modExists("clipboard") && table.modExists("selectRow")) {
                    // copy 이벤트 직전에 rowRange를 동적으로 설정
                    // keydown 이벤트를 사용하여 Ctrl+C를 감지
                    table.element.addEventListener("keydown", function(e) {
                        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.keyCode === 67)) {
                            const selectedRows = table.modules.selectRow.selectedRows;
                            // 선택된 행이 없고 clipboardCopyRowRange가 "selected"로 설정되어 있으면
                            // "active"로 변경하여 현재 페이지의 행 복사
                            if ((!selectedRows || selectedRows.length === 0) && 
                                table.modules.clipboard.rowRange === "selected") {
                                table.modules.clipboard.rowRange = "active";
                                // 복사 후 다시 "selected"로 복원
                                setTimeout(function() {
                                    table.modules.clipboard.rowRange = "selected";
                                }, 100);
                            }
                        }
                    });
                }
            });
            
            // 행 선택 변경 이벤트 핸들러 등록
            if (dotNetRef && enableCheckbox) {
                table.on("rowSelectionChanged", function(selectedData, selectedRows) {
                    if (dotNetRef) {
                        try {
                            dotNetRef.invokeMethodAsync('HandleRowSelectionChanged', selectedData?.length || 0).catch(err => {
                                log('error', 'Error invoking row selection changed callback', err);
                            });
                        } catch (error) {
                            log('error', 'Error in row selection changed handler', error);
                        }
                    }
                });
            }
            
            if (key) {
                tables.set(key, table);
            } else {
                // ID가 없는 경우 임시 키 사용
                tables.set(element, table);
            }

            log('info', 'Table initialized successfully', { key: key });
        } catch (error) {
            log('error', 'Failed to initialize Tabulator', error);
            throw error;
        }
    }

    /**
     * 테이블 데이터를 업데이트합니다.
     * @param {Element} element - 테이블 DOM 요소
     * @param {Array} data - 새로운 데이터
     */
    function setData(element, data) {
        const key = getKey(element);
        const table = tables.get(key);
        
        if (!table) {
            log('warn', `Table with key '${key}' not found. Cannot update data.`);
            return;
        }

        const tableData = Array.isArray(data) ? data : [];
        
        log('debug', 'Updating table data', {
            key: key,
            dataCount: tableData.length
        });

        try {
            table.replaceData(tableData);
        } catch (error) {
            log('error', 'Failed to update table data', error);
            throw error;
        }
    }

    /**
     * 테이블을 제거합니다.
     * @param {Element} element - 테이블 DOM 요소
     */
    function destroyTable(element) {
        const key = getKey(element);
        const table = tables.get(key);
        
        if (table) {
            try {
                table.destroy();
                log('debug', 'Table destroyed', { key: key });
            } catch (error) {
                log('error', 'Error destroying table', error);
            } finally {
                tables.delete(key);
            }
        }
    }

    /**
     * 테이블 데이터를 파일로 다운로드합니다.
     * @param {Element} element - 테이블 DOM 요소
     * @param {string} type - 다운로드 타입 (csv, json, xlsx, pdf, html)
     * @param {string} filename - 파일명
     * @param {object} options - 다운로드 옵션
     */
    function download(element, type, filename, options) {
        const key = getKey(element);
        const table = tables.get(key);
        
        if (!table) {
            log('warn', `Table with key '${key}' not found. Cannot download.`);
            throw new Error(`Table not found for key: ${key}`);
        }

        if (typeof table.download !== 'function') {
            const errorMsg = 'Download method not available. Make sure Tabulator download module is loaded.';
            log('error', errorMsg);
            throw new Error(errorMsg);
        }

        try {
            const finalFilename = filename || `export.${type}`;
            log('debug', `Downloading as ${type}`, { filename: finalFilename });
            table.download(type, finalFilename, options || {});
        } catch (error) {
            log('error', `Error downloading file as ${type}`, error);
            throw error;
        }
    }

    /**
     * 테이블을 HTML 문자열로 반환합니다.
     * @param {Element} element - 테이블 DOM 요소
     * @param {object} options - 옵션
     * @returns {string} HTML 문자열
     */
    function getHtml(element, options) {
        const key = getKey(element);
        const table = tables.get(key);
        
        if (!table) {
            log('warn', `Table with key '${key}' not found. Cannot get HTML.`);
            return '';
        }

        if (typeof table.getHtml !== 'function') {
            log('error', 'getHtml method not available. Make sure Tabulator export module is loaded.');
            return '';
        }

        try {
            return table.getHtml(options || {});
        } catch (error) {
            log('error', 'Error getting HTML', error);
            throw error;
        }
    }

    /**
     * 테이블을 인쇄합니다.
     * @param {Element} element - 테이블 DOM 요소
     * @param {object} options - 인쇄 옵션
     */
    function print(element, options) {
        const key = getKey(element);
        const table = tables.get(key);
        
        if (!table) {
            log('warn', `Table with key '${key}' not found. Cannot print.`);
            throw new Error(`Table not found for key: ${key}`);
        }

        if (typeof table.print !== 'function') {
            const errorMsg = 'Print method not available. Make sure Tabulator print module is loaded.';
            log('error', errorMsg);
            throw new Error(errorMsg);
        }

        try {
            log('debug', 'Printing table', { key: key });
            table.print(options || {});
        } catch (error) {
            log('error', 'Error printing table', error);
            throw error;
        }
    }

    /**
     * 테이블에 필터를 설정합니다.
     * @param {Element} element - 테이블 DOM 요소
     * @param {string|Array|Function} filter - 필터링할 필드명, 필터 배열 또는 커스텀 필터 함수
     * @param {string} type - 필터 타입 ("like", "=", "<", ">", "regex" 등)
     * @param {any} value - 필터 값
     */
    function setFilter(element, filter, type, value) {
        const key = getKey(element);
        const table = tables.get(key);
        
        if (!table) {
            log('warn', `Table with key '${key}' not found. Cannot set filter.`);
            throw new Error(`Table not found for key: ${key}`);
        }

        if (typeof table.setFilter !== 'function') {
            const errorMsg = 'setFilter method not available. Make sure Tabulator filter module is loaded.';
            log('error', errorMsg);
            throw new Error(errorMsg);
        }

        try {
            log('debug', 'Setting filter', { key: key, filter: filter, type: type, value: value });
            table.setFilter(filter, type, value);
        } catch (error) {
            log('error', 'Error setting filter', error);
            throw error;
        }
    }

    /**
     * 모든 필터를 제거합니다.
     * @param {Element} element - 테이블 DOM 요소
     */
    function clearFilter(element) {
        const key = getKey(element);
        const table = tables.get(key);
        
        if (!table) {
            log('warn', `Table with key '${key}' not found. Cannot clear filter.`);
            throw new Error(`Table not found for key: ${key}`);
        }

        if (typeof table.setFilter !== 'function') {
            const errorMsg = 'setFilter method not available. Make sure Tabulator filter module is loaded.';
            log('error', errorMsg);
            throw new Error(errorMsg);
        }

        try {
            log('debug', 'Clearing all filters', { key: key });
            // Tabulator에서 모든 필터를 제거하는 방법: setFilter(false) 사용
            if (typeof table.clearFilter === 'function') {
                table.clearFilter(true); // 헤더 필터 포함하여 모두 제거
            } else {
                table.setFilter(false); // 대체 방법
            }
        } catch (error) {
            log('error', 'Error clearing filter', error);
            throw error;
        }
    }

    /**
     * 모든 컬럼에서 검색을 수행합니다 (전역 검색).
     * @param {Element} element - 테이블 DOM 요소
     * @param {string} searchValue - 검색할 값
     * @param {string} filterType - 필터 타입 (기본값: "like")
     */
    function searchAll(element, searchValue, filterType) {
        const key = getKey(element);
        const table = tables.get(key);
        
        if (!table) {
            log('warn', `Table with key '${key}' not found. Cannot search.`);
            throw new Error(`Table not found for key: ${key}`);
        }

        if (typeof table.setFilter !== 'function') {
            const errorMsg = 'setFilter method not available. Make sure Tabulator filter module is loaded.';
            log('error', errorMsg);
            throw new Error(errorMsg);
        }

        try {
            const type = filterType || 'like';
            
            if (!searchValue || searchValue.trim() === '') {
                // 빈 검색어면 필터 제거
                if (typeof table.clearFilter === 'function') {
                    table.clearFilter(true);
                } else {
                    table.setFilter(false);
                }
                log('debug', 'Search cleared (empty value)', { key: key });
            } else {
                // 모든 컬럼에서 검색 - 커스텀 필터 함수를 사용하여 OR 조건으로 검색
                const columns = table.getColumns();
                const fieldNames = [];
                
                columns.forEach((column) => {
                    const field = column.getField();
                    if (field) {
                        fieldNames.push(field);
                    }
                });
                
                if (fieldNames.length > 0) {
                    // 커스텀 필터 함수: 모든 필드에서 검색어가 포함된 행 반환
                    table.setFilter(function(data) {
                        const searchLower = String(searchValue).toLowerCase();
                        
                        // 모든 필드를 확인하여 하나라도 일치하면 true 반환
                        for (let i = 0; i < fieldNames.length; i++) {
                            const fieldValue = data[fieldNames[i]];
                            if (fieldValue != null) {
                                const fieldStr = String(fieldValue).toLowerCase();
                                if (fieldStr.indexOf(searchLower) !== -1) {
                                    return true;
                                }
                            }
                        }
                        
                        return false;
                    });
                    
                    log('debug', 'Searching all columns', { key: key, value: searchValue, type: type, columns: fieldNames.length });
                } else {
                    log('warn', 'No columns found for search', { key: key });
                }
            }
        } catch (error) {
            log('error', 'Error performing search', error);
            throw error;
        }
    }

    /**
     * 마지막 편집을 취소합니다 (Undo).
     * @param {Element} element - 테이블 DOM 요소
     */
    function undo(element) {
        const key = getKey(element);
        const table = tables.get(key);
        
        if (!table) {
            log('warn', `Table with key '${key}' not found. Cannot undo.`);
            throw new Error(`Table not found for key: ${key}`);
        }

        if (typeof table.undo !== 'function') {
            const errorMsg = 'Undo method not available. Make sure Tabulator history module is loaded and history is enabled.';
            log('error', errorMsg);
            throw new Error(errorMsg);
        }

        try {
            log('debug', 'Undoing last edit', { key: key });
            table.undo();
        } catch (error) {
            log('error', 'Error undoing edit', error);
            throw error;
        }
    }

    /**
     * 마지막 취소한 편집을 다시 실행합니다 (Redo).
     * @param {Element} element - 테이블 DOM 요소
     */
    function redo(element) {
        const key = getKey(element);
        const table = tables.get(key);
        
        if (!table) {
            log('warn', `Table with key '${key}' not found. Cannot redo.`);
            throw new Error(`Table not found for key: ${key}`);
        }

        if (typeof table.redo !== 'function') {
            const errorMsg = 'Redo method not available. Make sure Tabulator history module is loaded and history is enabled.';
            log('error', errorMsg);
            throw new Error(errorMsg);
        }

        try {
            log('debug', 'Redoing last undone edit', { key: key });
            table.redo();
        } catch (error) {
            log('error', 'Error redoing edit', error);
            throw error;
        }
    }

    /**
     * Undo 가능한 히스토리 항목 수를 반환합니다.
     * @param {Element} element - 테이블 DOM 요소
     * @returns {number} Undo 가능한 항목 수
     */
    function getHistoryUndoSize(element) {
        const key = getKey(element);
        const table = tables.get(key);
        
        if (!table) {
            log('warn', `Table with key '${key}' not found.`);
            return 0;
        }

        if (typeof table.getHistoryUndoSize !== 'function') {
            return 0;
        }

        try {
            return table.getHistoryUndoSize() || 0;
        } catch (error) {
            log('error', 'Error getting undo size', error);
            return 0;
        }
    }

    /**
     * Redo 가능한 히스토리 항목 수를 반환합니다.
     * @param {Element} element - 테이블 DOM 요소
     * @returns {number} Redo 가능한 항목 수
     */
    function getHistoryRedoSize(element) {
        const key = getKey(element);
        const table = tables.get(key);
        
        if (!table) {
            log('warn', `Table with key '${key}' not found.`);
            return 0;
        }

        if (typeof table.getHistoryRedoSize !== 'function') {
            return 0;
        }

        try {
            return table.getHistoryRedoSize() || 0;
        } catch (error) {
            log('error', 'Error getting redo size', error);
            return 0;
        }
    }

    /**
     * 선택된 행의 데이터를 클립보드로 복사합니다.
     * @param {Element} element - 테이블 DOM 요소
     * @param {string} rowRange - 복사 범위 ("selected", "active", "visible", "all")
     */
    function copyToClipboard(element, rowRange) {
        const key = getKey(element);
        const table = tables.get(key);
        
        if (!table) {
            log('warn', `Table with key '${key}' not found. Cannot copy to clipboard.`);
            throw new Error(`Table not found for key: ${key}`);
        }

        if (typeof table.copyToClipboard !== 'function') {
            const errorMsg = 'copyToClipboard method not available. Make sure Tabulator clipboard module is loaded.';
            log('error', errorMsg);
            throw new Error(errorMsg);
        }

        try {
            const range = rowRange || "selected";
            log('debug', 'Copying to clipboard', { key: key, rowRange: range });
            table.copyToClipboard(range);
        } catch (error) {
            log('error', 'Error copying to clipboard', error);
            throw error;
        }
    }

    /**
     * 선택된 행의 데이터를 가져옵니다.
     * @param {Element} element - 테이블 DOM 요소
     * @returns {Array} 선택된 행의 데이터 배열
     */
    function getSelectedData(element) {
        const key = getKey(element);
        const table = tables.get(key);
        
        if (!table) {
            log('warn', `Table with key '${key}' not found. Cannot get selected data.`);
            return [];
        }

        if (typeof table.getSelectedData !== 'function') {
            log('warn', 'getSelectedData method not available. Make sure Tabulator selectRow module is loaded.');
            return [];
        }

        try {
            return table.getSelectedData() || [];
        } catch (error) {
            log('error', 'Error getting selected data', error);
            return [];
        }
    }

    /**
     * 선택된 행 객체를 가져옵니다.
     * @param {Element} element - 테이블 DOM 요소
     * @returns {Array} 선택된 행 객체 배열
     */
    function getSelectedRows(element) {
        const key = getKey(element);
        const table = tables.get(key);
        
        if (!table) {
            log('warn', `Table with key '${key}' not found. Cannot get selected rows.`);
            return [];
        }

        if (typeof table.getSelectedRows !== 'function') {
            log('warn', 'getSelectedRows method not available. Make sure Tabulator selectRow module is loaded.');
            return [];
        }

        try {
            const rows = table.getSelectedRows() || [];
            // 행 객체를 데이터로 변환 (직렬화 가능하도록)
            return rows.map(row => row.getData());
        } catch (error) {
            log('error', 'Error getting selected rows', error);
            return [];
        }
    }

    /**
     * 행을 선택합니다.
     * @param {Element} element - 테이블 DOM 요소
     * @param {number|string|Array|Function} rowFilter - 선택할 행 필터 (인덱스, ID, 배열, 또는 함수)
     */
    function selectRow(element, rowFilter) {
        const key = getKey(element);
        const table = tables.get(key);
        
        if (!table) {
            log('warn', `Table with key '${key}' not found. Cannot select row.`);
            throw new Error(`Table not found for key: ${key}`);
        }

        if (typeof table.selectRow !== 'function') {
            const errorMsg = 'selectRow method not available. Make sure Tabulator selectRow module is loaded.';
            log('error', errorMsg);
            throw new Error(errorMsg);
        }

        try {
            log('debug', 'Selecting row', { key: key, rowFilter: rowFilter });
            table.selectRow(rowFilter);
        } catch (error) {
            log('error', 'Error selecting row', error);
            throw error;
        }
    }

    /**
     * 행 선택을 해제합니다.
     * @param {Element} element - 테이블 DOM 요소
     * @param {number|string|Array|Function} rowFilter - 선택 해제할 행 필터 (인덱스, ID, 배열, 또는 함수)
     */
    function deselectRow(element, rowFilter) {
        const key = getKey(element);
        const table = tables.get(key);
        
        if (!table) {
            log('warn', `Table with key '${key}' not found. Cannot deselect row.`);
            throw new Error(`Table not found for key: ${key}`);
        }

        if (typeof table.deselectRow !== 'function') {
            const errorMsg = 'deselectRow method not available. Make sure Tabulator selectRow module is loaded.';
            log('error', errorMsg);
            throw new Error(errorMsg);
        }

        try {
            log('debug', 'Deselecting row', { key: key, rowFilter: rowFilter });
            table.deselectRow(rowFilter);
        } catch (error) {
            log('error', 'Error deselecting row', error);
            throw error;
        }
    }

    /**
     * 행 선택 상태를 토글합니다.
     * @param {Element} element - 테이블 DOM 요소
     * @param {number|string|Array|Function} rowFilter - 토글할 행 필터 (인덱스, ID, 배열, 또는 함수)
     */
    function toggleSelectRow(element, rowFilter) {
        const key = getKey(element);
        const table = tables.get(key);
        
        if (!table) {
            log('warn', `Table with key '${key}' not found. Cannot toggle row selection.`);
            throw new Error(`Table not found for key: ${key}`);
        }

        if (typeof table.toggleSelectRow !== 'function') {
            const errorMsg = 'toggleSelectRow method not available. Make sure Tabulator selectRow module is loaded.';
            log('error', errorMsg);
            throw new Error(errorMsg);
        }

        try {
            log('debug', 'Toggling row selection', { key: key, rowFilter: rowFilter });
            table.toggleSelectRow(rowFilter);
        } catch (error) {
            log('error', 'Error toggling row selection', error);
            throw error;
        }
    }

    return {
        initTable,
        setData,
        destroyTable,
        download,
        getHtml,
        print,
        setFilter,
        clearFilter,
        searchAll,
        undo,
        redo,
        getHistoryUndoSize,
        getHistoryRedoSize,
        copyToClipboard,
        getSelectedData,
        getSelectedRows,
        selectRow,
        deselectRow,
        toggleSelectRow
    };
})();
