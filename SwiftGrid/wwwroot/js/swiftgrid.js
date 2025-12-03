// SwiftGrid JavaScript Module
// SwiftGrid - Blazor wrapper for Tabulator
// Version: 1.0.0
window.swiftGrid = (function () {
  "use strict";

  // ============================================
  // Constants
  // ============================================

  const MODULE_NAME = "SwiftGrid";
  const DEFAULT_LAYOUT = "fitColumns";
  const DEFAULT_PAGINATION_MODE = "local";
  const DEFAULT_PAGINATION_COUNTER = "rows";
  const SUPPORTED_DOWNLOAD_TYPES = ["csv", "json", "xlsx", "pdf", "html"];

  // 체크박스 컬럼 설정
  const CHECKBOX_COLUMN_WIDTH = 50;
  const CHECKBOX_COLUMN_ALIGN = "center";
  const CHECKBOX_COLUMN_VERT_ALIGN = "middle";

  // 클립보드 설정
  const DEFAULT_CLIPBOARD_ROW_RANGE = "selected";
  const FALLBACK_CLIPBOARD_ROW_RANGE = "active";
  const CLIPBOARD_RESTORE_DELAY = 100;

  // 검색 설정
  const DEFAULT_FILTER_TYPE = "like";
  const SEARCH_CASE_SENSITIVE = false;

  // 이벤트 키 코드
  const KEY_CODE_C = 67;

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
    if (!console || typeof console[level] !== "function") {
      return;
    }

    const prefix = `[${MODULE_NAME}]`;
    const fullMessage = `${prefix} ${message}`;

    if (data !== undefined) {
      console[level](fullMessage, data);
    } else {
      console[level](fullMessage);
    }
  }

  /**
   * 요소의 고유 키를 가져옵니다.
   * @param {Element|string} element - DOM 요소 또는 요소 참조
   * @returns {string|Element|null} 요소의 ID 또는 요소 자체
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
   * 테이블 인스턴스를 안전하게 조회합니다.
   * @param {Element|string} element - 테이블 DOM 요소
   * @returns {{table: Tabulator, key: string}|null} 테이블 인스턴스와 키, 없으면 null
   */
  function getTable(element) {
    const key = getKey(element);
    if (!key) {
      return null;
    }

    const table = tables.get(key);
    if (!table) {
      return null;
    }

    return { table, key };
  }

  /**
   * 테이블 조회 및 유효성 검사를 수행합니다.
   * @param {Element|string} element - 테이블 DOM 요소
   * @param {string} operation - 수행할 작업 이름 (에러 메시지용)
   * @param {string} [requiredMethod] - 필요한 메서드 이름
   * @returns {{table: Tabulator, key: string}|null} 테이블 인스턴스와 키
   * @throws {Error} 테이블을 찾을 수 없거나 필요한 메서드가 없는 경우
   */
  function getTableWithValidation(element, operation, requiredMethod) {
    const result = getTable(element);
    if (!result) {
      const key = getKey(element);
      log("warn", `Table with key '${key}' not found. Cannot ${operation}.`);
      throw new Error(`Table not found for key: ${key}`);
    }

    if (requiredMethod && typeof result.table[requiredMethod] !== "function") {
      const errorMsg = `${requiredMethod} method not available. Make sure the required Tabulator module is loaded.`;
      log("error", errorMsg);
      throw new Error(errorMsg);
    }

    return result;
  }

  /**
   * 필드명을 camelCase로 정규화합니다.
   * @param {string} field - 원본 필드명
   * @returns {string} 정규화된 필드명
   */
  function normalizeFieldName(field) {
    if (!field || typeof field !== "string") {
      return field;
    }
    return field.charAt(0).toLowerCase() + field.slice(1);
  }

  /**
   * 컬럼 속성을 안전하게 설정합니다.
   * @param {object} target - 대상 객체
   * @param {string} key - 속성 키
   * @param {any} value - 속성 값
   * @param {any} defaultValue - 기본값 (null이 아닌 경우에만 설정)
   */
  function setPropertyIfNotNull(target, key, value, defaultValue = null) {
    if (value !== null && value !== undefined) {
      target[key] = value;
    } else if (defaultValue !== null) {
      target[key] = defaultValue;
    }
  }

  // ============================================
  // Column Conversion Functions
  // ============================================

  /**
   * 컬럼 정의를 Tabulator 형식으로 변환합니다.
   * @param {Array} columns - C#에서 전달된 컬럼 정의 배열
   * @returns {Array} Tabulator 컬럼 정의 배열
   */
  function convertColumns(columns) {
    if (!columns?.length) {
      return [];
    }

    // 처리된 속성 목록 (중복 복사 방지)
    const PROCESSED_PROPERTIES = new Set([
      "field",
      "title",
      "sortable",
      "visible",
      "width",
      "formatter",
      "headerfilter",
      "headerfilterplaceholder",
      "headerfilterparams",
      "editable",
      "editor",
      "editorparams",
    ]);

    return columns.map((col) => {
      const sortable = getProperty(col, "sortable", "Sortable", false);
      const visible = getProperty(col, "visible", "Visible", true);
      const rawField = getProperty(col, "field", "Field", "");

      const tabCol = {
        field: normalizeFieldName(rawField),
        title: getProperty(col, "title", "Title", ""),
        headerSort: sortable,
        visible: visible,
      };

      // 너비 설정
      const width = getProperty(col, "width", "Width", null);
      setPropertyIfNotNull(tabCol, "width", width);

      // 포맷터 설정
      const formatter = getProperty(col, "formatter", "Formatter", null);
      setPropertyIfNotNull(tabCol, "formatter", formatter);

      // 헤더 필터 옵션 설정
      const headerFilter = getProperty(
        col,
        "headerFilter",
        "HeaderFilter",
        null
      );
      if (headerFilter !== null && headerFilter !== undefined) {
        tabCol.headerFilter = headerFilter === true ? "input" : headerFilter;
      }

      const headerFilterPlaceholder = getProperty(
        col,
        "headerFilterPlaceholder",
        "HeaderFilterPlaceholder",
        null
      );
      setPropertyIfNotNull(tabCol, "headerFilterPlaceholder", headerFilterPlaceholder);

      const headerFilterParams = getProperty(
        col,
        "headerFilterParams",
        "HeaderFilterParams",
        null
      );
      setPropertyIfNotNull(tabCol, "headerFilterParams", headerFilterParams);

      // 편집 옵션 설정
      const editable = getProperty(col, "editable", "Editable", null);
      if (editable !== null && editable !== undefined) {
        tabCol.editable = editable === true ? true : editable;
      }

      const editor = getProperty(col, "editor", "Editor", null);
      setPropertyIfNotNull(tabCol, "editor", editor);

      const editorParams = getProperty(
        col,
        "editorParams",
        "EditorParams",
        null
      );
      setPropertyIfNotNull(tabCol, "editorParams", editorParams);

      // 추가 속성 동적 복사 (처리되지 않은 속성만)
      Object.keys(col).forEach((key) => {
        const lowerKey = key.toLowerCase();
        if (!PROCESSED_PROPERTIES.has(lowerKey) && !tabCol.hasOwnProperty(key)) {
          tabCol[key] = col[key];
        }
      });

      return tabCol;
    });
  }

  /**
   * 체크박스 컬럼 정의를 생성합니다.
   * @param {string} rowRange - 행 선택 범위
   * @returns {object} 체크박스 컬럼 정의
   */
  function createCheckboxColumn(rowRange) {
    return {
      formatter: "rowSelection",
      titleFormatter: "rowSelection",
      formatterParams: {
        rowRange: rowRange,
      },
      titleFormatterParams: {
        rowRange: rowRange,
      },
      cellClick: function (e, cell) {
        // 체크박스 자체를 클릭한 경우는 이미 처리되므로 무시
        if (
          e.target &&
          (e.target.type === "checkbox" ||
            e.target.closest('input[type="checkbox"]'))
        ) {
          return;
        }
        // 셀의 다른 부분을 클릭한 경우 행 선택 토글
        const row = cell.getRow();
        if (row) {
          row.toggleSelect();
        }
      },
      headerSort: false,
      hozAlign: CHECKBOX_COLUMN_ALIGN,
      vertAlign: CHECKBOX_COLUMN_VERT_ALIGN,
      headerHozAlign: CHECKBOX_COLUMN_ALIGN,
      headerVertAlign: CHECKBOX_COLUMN_VERT_ALIGN,
      width: CHECKBOX_COLUMN_WIDTH,
      frozen: true,
      resizable: false,
    };
  }

  // ============================================
  // Options Conversion Functions
  // ============================================

  /**
   * 페이지네이션 옵션을 변환합니다.
   * @param {object} options - C# 옵션 객체
   * @param {object} tabOptions - Tabulator 옵션 객체 (수정됨)
   */
  function convertPaginationOptions(options, tabOptions) {
    const pagination = getProperty(options, "pagination", "Pagination", false);
    if (!pagination) {
      return;
    }

    tabOptions.pagination =
      pagination === true ? DEFAULT_PAGINATION_MODE : pagination;

    const paginationSize = getProperty(
      options,
      "paginationSize",
      "PaginationSize",
      null
    );
    setPropertyIfNotNull(tabOptions, "paginationSize", paginationSize);

    const paginationMode = getProperty(
      options,
      "paginationMode",
      "PaginationMode",
      null
    );
    setPropertyIfNotNull(tabOptions, "paginationMode", paginationMode);

    // paginationCounter 처리
    const paginationCounter = getProperty(
      options,
      "paginationCounter",
      "PaginationCounter",
      null
    );
    if (paginationCounter !== null && paginationCounter !== false) {
      tabOptions.paginationCounter =
        paginationCounter === true
          ? DEFAULT_PAGINATION_COUNTER
          : paginationCounter;
    } else if (paginationCounter === false) {
      tabOptions.paginationCounter = false;
    }

    const paginationSizeSelector = getProperty(
      options,
      "paginationSizeSelector",
      "PaginationSizeSelector",
      null
    );
    setPropertyIfNotNull(tabOptions, "paginationSizeSelector", paginationSizeSelector);

    const paginationButtonCount = getProperty(
      options,
      "paginationButtonCount",
      "PaginationButtonCount",
      null
    );
    setPropertyIfNotNull(tabOptions, "paginationButtonCount", paginationButtonCount);
  }

  /**
   * 행 클릭 이벤트 핸들러를 생성합니다.
   * @param {DotNetObjectReference} dotNetRef - .NET 객체 참조
   * @returns {Function} 행 클릭 이벤트 핸들러
   */
  function createRowClickHandler(dotNetRef) {
    return function (e, row) {
      if (!dotNetRef) {
        return;
      }

      try {
        const rowData = row.getData();
        dotNetRef
          .invokeMethodAsync("HandleRowClicked", rowData)
          .catch((err) => {
            log("error", "Error invoking row click callback", err);
          });
      } catch (error) {
        log("error", "Error in row click handler", error);
      }
    };
  }

  /**
   * 셀 편집 완료 이벤트 핸들러를 생성합니다.
   * @param {DotNetObjectReference} dotNetRef - .NET 객체 참조
   * @returns {Function} 셀 편집 완료 이벤트 핸들러
   */
  function createCellEditedHandler(dotNetRef) {
    return function (cell) {
      if (!dotNetRef) {
        return;
      }

      try {
        const cellComponent =
          typeof cell.getComponent === "function"
            ? cell.getComponent()
            : cell;

        const cellData = {
          field: cellComponent.getField(),
          value: cellComponent.getValue(),
          oldValue:
            typeof cellComponent.getOldValue === "function"
              ? cellComponent.getOldValue()
              : null,
          row: cellComponent.getRow().getData(),
        };

        dotNetRef
          .invokeMethodAsync("HandleCellEdited", cellData)
          .catch((err) => {
            log("error", "Error invoking cell edited callback", err);
          });
      } catch (error) {
        log("error", "Error in cell edited handler", error);
      }
    };
  }

  /**
   * 기본 행 컨텍스트 메뉴를 생성합니다.
   * @returns {Array} 컨텍스트 메뉴 항목 배열
   */
  function createDefaultRowContextMenu() {
    return [
      {
        label: "복사",
        action: function (e, row) {
          try {
            const table = row.getTable();
            if (table && typeof table.copyToClipboard === "function") {
              table.copyToClipboard(DEFAULT_CLIPBOARD_ROW_RANGE);
            }
          } catch (error) {
            log("error", "Error copying row to clipboard", error);
          }
        },
      },
      {
        label: "선택",
        action: function (e, row) {
          try {
            row.toggleSelect();
          } catch (error) {
            log("error", "Error toggling row selection", error);
          }
        },
      },
      {
        separator: true,
      },
      {
        label: "삭제",
        action: function (e, row) {
          try {
            row.delete();
          } catch (error) {
            log("error", "Error deleting row", error);
          }
        },
      },
    ];
  }

  /**
   * C# 옵션 객체를 Tabulator 형식으로 변환합니다.
   * @param {any} options - C#에서 전달된 옵션 객체
   * @param {DotNetObjectReference} dotNetRef - .NET 객체 참조
   * @returns {object} Tabulator 옵션 객체
   */
  function convertOptions(options, dotNetRef) {
    const tabOptions = {
      layout: getProperty(options, "layout", "Layout", DEFAULT_LAYOUT),
      height: getProperty(options, "height", "Height", null),
      selectable: getProperty(options, "selectable", "Selectable", 1),
      rowClick: createRowClickHandler(dotNetRef),
    };

    // 페이지네이션 옵션 추가
    convertPaginationOptions(options, tabOptions);

    // 히스토리(undo/redo) 옵션 추가
    const history = getProperty(options, "history", "History", false);
    setPropertyIfNotNull(tabOptions, "history", history);

    // 편집 트리거 이벤트 옵션 추가
    const editTriggerEvent = getProperty(
      options,
      "editTriggerEvent",
      "EditTriggerEvent",
      null
    );
    setPropertyIfNotNull(tabOptions, "editTriggerEvent", editTriggerEvent);

    // 클립보드 옵션 추가
    const clipboard = getProperty(options, "clipboard", "Clipboard", null);
    setPropertyIfNotNull(tabOptions, "clipboard", clipboard);

    const clipboardCopyRowRange = getProperty(
      options,
      "clipboardCopyRowRange",
      "ClipboardCopyRowRange",
      DEFAULT_CLIPBOARD_ROW_RANGE
    );
    tabOptions.clipboardCopyRowRange =
      clipboardCopyRowRange || DEFAULT_CLIPBOARD_ROW_RANGE;

    // 행 컨텍스트 메뉴 옵션 추가
    const enableRowContextMenu = getProperty(
      options,
      "enableRowContextMenu",
      "EnableRowContextMenu",
      false
    );
    if (enableRowContextMenu) {
      tabOptions.rowContextMenu = createDefaultRowContextMenu();
    }

    // 셀 편집 완료 이벤트 핸들러 추가
    if (dotNetRef) {
      tabOptions.cellEdited = createCellEditedHandler(dotNetRef);
    }

    return tabOptions;
  }

  // ============================================
  // Event Handlers
  // ============================================

  /**
   * 클립보드 복사 이벤트 핸들러를 설정합니다.
   * 선택된 행이 없을 때 fallback 범위를 사용합니다.
   * @param {Tabulator} table - Tabulator 테이블 인스턴스
   */
  function setupClipboardFallbackHandler(table) {
    if (!table.modExists("clipboard") || !table.modExists("selectRow")) {
      return;
    }

    // 이벤트 리스너를 한 번만 등록하기 위해 함수 참조 저장
    const keydownHandler = function (e) {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "c" || e.keyCode === KEY_CODE_C)
      ) {
        const selectedRows = table.modules.selectRow.selectedRows;
        // 선택된 행이 없고 clipboardCopyRowRange가 "selected"로 설정되어 있으면
        // "active"로 변경하여 현재 페이지의 행 복사
        if (
          (!selectedRows || selectedRows.length === 0) &&
          table.modules.clipboard.rowRange === DEFAULT_CLIPBOARD_ROW_RANGE
        ) {
          table.modules.clipboard.rowRange = FALLBACK_CLIPBOARD_ROW_RANGE;
          // 복사 후 다시 "selected"로 복원
          setTimeout(function () {
            table.modules.clipboard.rowRange = DEFAULT_CLIPBOARD_ROW_RANGE;
          }, CLIPBOARD_RESTORE_DELAY);
        }
      }
    };

    table.element.addEventListener("keydown", keydownHandler);
  }

  /**
   * 행 선택 변경 이벤트 핸들러를 설정합니다.
   * @param {Tabulator} table - Tabulator 테이블 인스턴스
   * @param {DotNetObjectReference} dotNetRef - .NET 객체 참조
   */
  function setupRowSelectionChangedHandler(table, dotNetRef) {
    if (!dotNetRef) {
      return;
    }

    table.on("rowSelectionChanged", function (selectedData) {
      if (!dotNetRef) {
        return;
      }

      try {
        dotNetRef
          .invokeMethodAsync(
            "HandleRowSelectionChanged",
            selectedData?.length || 0
          )
          .catch((err) => {
            log(
              "error",
              "Error invoking row selection changed callback",
              err
            );
          });
      } catch (error) {
        log("error", "Error in row selection changed handler", error);
      }
    });
  }

  // ============================================
  // Table Initialization
  // ============================================

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
      log("error", "Invalid element provided for table initialization");
      throw new Error("Invalid element provided for table initialization");
    }

    const key = getKey(element);
    if (key && tables.has(key)) {
      log(
        "warn",
        `Table with key '${key}' already exists. Destroying existing table.`
      );
      destroyTable(element);
    }

    let convertedColumns = convertColumns(columns);
    const tableData = Array.isArray(data) ? data : [];

    // 체크박스 선택 활성화 옵션 확인
    const enableCheckbox = getProperty(
      options,
      "enableRowSelectionCheckbox",
      "EnableRowSelectionCheckbox",
      false
    );
    if (enableCheckbox) {
      const rowSelectionRange = getProperty(
        options,
        "rowSelectionRange",
        "RowSelectionRange",
        FALLBACK_CLIPBOARD_ROW_RANGE
      );
      const finalRange = rowSelectionRange || FALLBACK_CLIPBOARD_ROW_RANGE;

      const checkboxColumn = createCheckboxColumn(finalRange);
      convertedColumns = [checkboxColumn, ...convertedColumns];

      log("debug", "Row selection checkbox column added", {
        rowRange: finalRange,
      });
    }

    log("debug", "Initializing table", {
      key: key,
      dataCount: tableData.length,
      columnsCount: convertedColumns.length,
      hasData: tableData.length > 0,
      checkboxEnabled: enableCheckbox,
    });

    if (!window.Tabulator) {
      log(
        "error",
        "Tabulator library is not loaded. Make sure tabulator.min.js is included before swiftgrid.js"
      );
      throw new Error("Tabulator library is not loaded");
    }

    try {
      const tabulatorOptions = {
        data: tableData,
        columns: convertedColumns,
        ...convertOptions(options, dotNetRef),
      };

      const table = new Tabulator(element, tabulatorOptions);

      // 테이블이 완전히 초기화된 후 이벤트 리스너 추가
      table.on("tableBuilt", function () {
        setupClipboardFallbackHandler(table);
      });

      // 행 선택 변경 이벤트 핸들러 등록
      if (enableCheckbox) {
        setupRowSelectionChangedHandler(table, dotNetRef);
      }

      // 테이블 인스턴스 저장
      if (key) {
        tables.set(key, table);
      } else {
        // ID가 없는 경우 임시 키 사용
        tables.set(element, table);
      }

      log("info", "Table initialized successfully", { key: key });
    } catch (error) {
      log("error", "Failed to initialize Tabulator", error);
      throw error;
    }
  }

  // ============================================
  // Table Data Operations
  // ============================================

  /**
   * 테이블 데이터를 업데이트합니다.
   * @param {Element} element - 테이블 DOM 요소
   * @param {Array} data - 새로운 데이터
   */
  function setData(element, data) {
    const { table, key } = getTableWithValidation(element, "update data");

    const tableData = Array.isArray(data) ? data : [];

    log("debug", "Updating table data", {
      key: key,
      dataCount: tableData.length,
    });

    try {
      table.replaceData(tableData);
    } catch (error) {
      log("error", "Failed to update table data", error);
      throw error;
    }
  }

  // ============================================
  // Table Lifecycle
  // ============================================

  /**
   * 테이블을 제거합니다.
   * @param {Element} element - 테이블 DOM 요소
   */
  function destroyTable(element) {
    const result = getTable(element);
    if (!result) {
      return;
    }

    const { table, key } = result;

    try {
      table.destroy();
      log("debug", "Table destroyed", { key: key });
    } catch (error) {
      log("error", "Error destroying table", error);
    } finally {
      tables.delete(key);
    }
  }

  // ============================================
  // Export Functions
  // ============================================

  /**
   * 테이블 데이터를 파일로 다운로드합니다.
   * @param {Element} element - 테이블 DOM 요소
   * @param {string} type - 다운로드 타입 (csv, json, xlsx, pdf, html)
   * @param {string} filename - 파일명
   * @param {object} options - 다운로드 옵션
   */
  function download(element, type, filename, options) {
    const { table, key } = getTableWithValidation(
      element,
      "download",
      "download"
    );

    try {
      const finalFilename = filename || `export.${type}`;
      log("debug", `Downloading as ${type}`, { filename: finalFilename });
      table.download(type, finalFilename, options || {});
    } catch (error) {
      log("error", `Error downloading file as ${type}`, error);
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
    const result = getTable(element);
    if (!result) {
      const key = getKey(element);
      log("warn", `Table with key '${key}' not found. Cannot get HTML.`);
      return "";
    }

    const { table } = result;

    if (typeof table.getHtml !== "function") {
      log(
        "error",
        "getHtml method not available. Make sure Tabulator export module is loaded."
      );
      return "";
    }

    try {
      return table.getHtml(options || {});
    } catch (error) {
      log("error", "Error getting HTML", error);
      throw error;
    }
  }

  /**
   * 테이블을 인쇄합니다.
   * @param {Element} element - 테이블 DOM 요소
   * @param {object} options - 인쇄 옵션
   */
  function print(element, options) {
    const { table } = getTableWithValidation(element, "print", "print");

    try {
      log("debug", "Printing table", { key: getKey(element) });
      table.print(options || {});
    } catch (error) {
      log("error", "Error printing table", error);
      throw error;
    }
  }

  // ============================================
  // Filter Functions
  // ============================================

  /**
   * 테이블에 필터를 설정합니다.
   * @param {Element} element - 테이블 DOM 요소
   * @param {string|Array|Function} filter - 필터링할 필드명, 필터 배열 또는 커스텀 필터 함수
   * @param {string} type - 필터 타입 ("like", "=", "<", ">", "regex" 등)
   * @param {any} value - 필터 값
   */
  function setFilter(element, filter, type, value) {
    const { table, key } = getTableWithValidation(
      element,
      "set filter",
      "setFilter"
    );

    try {
      log("debug", "Setting filter", {
        key: key,
        filter: filter,
        type: type,
        value: value,
      });
      table.setFilter(filter, type, value);
    } catch (error) {
      log("error", "Error setting filter", error);
      throw error;
    }
  }

  /**
   * 모든 필터를 제거합니다.
   * @param {Element} element - 테이블 DOM 요소
   */
  function clearFilter(element) {
    const { table, key } = getTableWithValidation(
      element,
      "clear filter",
      "setFilter"
    );

    try {
      log("debug", "Clearing all filters", { key: key });
      // Tabulator에서 모든 필터를 제거하는 방법
      if (typeof table.clearFilter === "function") {
        table.clearFilter(true); // 헤더 필터 포함하여 모두 제거
      } else {
        table.setFilter(false); // 대체 방법
      }
    } catch (error) {
      log("error", "Error clearing filter", error);
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
    const { table, key } = getTableWithValidation(
      element,
      "search",
      "setFilter"
    );

    try {
      const type = filterType || DEFAULT_FILTER_TYPE;

      if (!searchValue || searchValue.trim() === "") {
        // 빈 검색어면 필터 제거
        if (typeof table.clearFilter === "function") {
          table.clearFilter(true);
        } else {
          table.setFilter(false);
        }
        log("debug", "Search cleared (empty value)", { key: key });
        return;
      }

      // 모든 컬럼에서 검색 - 커스텀 필터 함수를 사용하여 OR 조건으로 검색
      const columns = table.getColumns();
      const fieldNames = [];

      for (let i = 0; i < columns.length; i++) {
        const field = columns[i].getField();
        if (field) {
          fieldNames.push(field);
        }
      }

      if (fieldNames.length === 0) {
        log("warn", "No columns found for search", { key: key });
        return;
      }

      // 커스텀 필터 함수: 모든 필드에서 검색어가 포함된 행 반환
      const searchLower = SEARCH_CASE_SENSITIVE
        ? String(searchValue)
        : String(searchValue).toLowerCase();

      table.setFilter(function (data) {
        // 모든 필드를 확인하여 하나라도 일치하면 true 반환
        for (let i = 0; i < fieldNames.length; i++) {
          const fieldValue = data[fieldNames[i]];
          if (fieldValue != null) {
            const fieldStr = SEARCH_CASE_SENSITIVE
              ? String(fieldValue)
              : String(fieldValue).toLowerCase();
            if (fieldStr.indexOf(searchLower) !== -1) {
              return true;
            }
          }
        }
        return false;
      });

      log("debug", "Searching all columns", {
        key: key,
        value: searchValue,
        type: type,
        columns: fieldNames.length,
      });
    } catch (error) {
      log("error", "Error performing search", error);
      throw error;
    }
  }

  // ============================================
  // History Functions
  // ============================================

  /**
   * 마지막 편집을 취소합니다 (Undo).
   * @param {Element} element - 테이블 DOM 요소
   */
  function undo(element) {
    const { table } = getTableWithValidation(element, "undo", "undo");

    try {
      log("debug", "Undoing last edit", { key: getKey(element) });
      table.undo();
    } catch (error) {
      log("error", "Error undoing edit", error);
      throw error;
    }
  }

  /**
   * 마지막 취소한 편집을 다시 실행합니다 (Redo).
   * @param {Element} element - 테이블 DOM 요소
   */
  function redo(element) {
    const { table } = getTableWithValidation(element, "redo", "redo");

    try {
      log("debug", "Redoing last undone edit", { key: getKey(element) });
      table.redo();
    } catch (error) {
      log("error", "Error redoing edit", error);
      throw error;
    }
  }

  /**
   * Undo 가능한 히스토리 항목 수를 반환합니다.
   * @param {Element} element - 테이블 DOM 요소
   * @returns {number} Undo 가능한 항목 수
   */
  function getHistoryUndoSize(element) {
    const result = getTable(element);
    if (!result) {
      return 0;
    }

    const { table } = result;

    if (typeof table.getHistoryUndoSize !== "function") {
      return 0;
    }

    try {
      return table.getHistoryUndoSize() || 0;
    } catch (error) {
      log("error", "Error getting undo size", error);
      return 0;
    }
  }

  /**
   * Redo 가능한 히스토리 항목 수를 반환합니다.
   * @param {Element} element - 테이블 DOM 요소
   * @returns {number} Redo 가능한 항목 수
   */
  function getHistoryRedoSize(element) {
    const result = getTable(element);
    if (!result) {
      return 0;
    }

    const { table } = result;

    if (typeof table.getHistoryRedoSize !== "function") {
      return 0;
    }

    try {
      return table.getHistoryRedoSize() || 0;
    } catch (error) {
      log("error", "Error getting redo size", error);
      return 0;
    }
  }

  // ============================================
  // Clipboard Functions
  // ============================================

  /**
   * 선택된 행의 데이터를 클립보드로 복사합니다.
   * @param {Element} element - 테이블 DOM 요소
   * @param {string} rowRange - 복사 범위 ("selected", "active", "visible", "all")
   */
  function copyToClipboard(element, rowRange) {
    const { table, key } = getTableWithValidation(
      element,
      "copy to clipboard",
      "copyToClipboard"
    );

    try {
      const range = rowRange || DEFAULT_CLIPBOARD_ROW_RANGE;
      log("debug", "Copying to clipboard", { key: key, rowRange: range });
      table.copyToClipboard(range);
    } catch (error) {
      log("error", "Error copying to clipboard", error);
      throw error;
    }
  }

  // ============================================
  // Row Selection Functions
  // ============================================

  /**
   * 선택된 행의 데이터를 가져옵니다.
   * @param {Element} element - 테이블 DOM 요소
   * @returns {Array} 선택된 행의 데이터 배열
   */
  function getSelectedData(element) {
    const result = getTable(element);
    if (!result) {
      const key = getKey(element);
      log(
        "warn",
        `Table with key '${key}' not found. Cannot get selected data.`
      );
      return [];
    }

    const { table } = result;

    if (typeof table.getSelectedData !== "function") {
      log(
        "warn",
        "getSelectedData method not available. Make sure Tabulator selectRow module is loaded."
      );
      return [];
    }

    try {
      return table.getSelectedData() || [];
    } catch (error) {
      log("error", "Error getting selected data", error);
      return [];
    }
  }

  /**
   * 선택된 행 객체를 가져옵니다.
   * @param {Element} element - 테이블 DOM 요소
   * @returns {Array} 선택된 행 객체 배열
   */
  function getSelectedRows(element) {
    const result = getTable(element);
    if (!result) {
      const key = getKey(element);
      log(
        "warn",
        `Table with key '${key}' not found. Cannot get selected rows.`
      );
      return [];
    }

    const { table } = result;

    if (typeof table.getSelectedRows !== "function") {
      log(
        "warn",
        "getSelectedRows method not available. Make sure Tabulator selectRow module is loaded."
      );
      return [];
    }

    try {
      const rows = table.getSelectedRows() || [];
      // 행 객체를 데이터로 변환 (직렬화 가능하도록)
      return rows.map((row) => row.getData());
    } catch (error) {
      log("error", "Error getting selected rows", error);
      return [];
    }
  }

  /**
   * 행을 선택합니다.
   * @param {Element} element - 테이블 DOM 요소
   * @param {number|string|Array|Function} rowFilter - 선택할 행 필터 (인덱스, ID, 배열, 또는 함수)
   */
  function selectRow(element, rowFilter) {
    const { table, key } = getTableWithValidation(
      element,
      "select row",
      "selectRow"
    );

    try {
      log("debug", "Selecting row", { key: key, rowFilter: rowFilter });
      table.selectRow(rowFilter);
    } catch (error) {
      log("error", "Error selecting row", error);
      throw error;
    }
  }

  /**
   * 행 선택을 해제합니다.
   * @param {Element} element - 테이블 DOM 요소
   * @param {number|string|Array|Function} rowFilter - 선택 해제할 행 필터 (인덱스, ID, 배열, 또는 함수)
   */
  function deselectRow(element, rowFilter) {
    const { table, key } = getTableWithValidation(
      element,
      "deselect row",
      "deselectRow"
    );

    try {
      log("debug", "Deselecting row", { key: key, rowFilter: rowFilter });
      table.deselectRow(rowFilter);
    } catch (error) {
      log("error", "Error deselecting row", error);
      throw error;
    }
  }

  /**
   * 행 선택 상태를 토글합니다.
   * @param {Element} element - 테이블 DOM 요소
   * @param {number|string|Array|Function} rowFilter - 토글할 행 필터 (인덱스, ID, 배열, 또는 함수)
   */
  function toggleSelectRow(element, rowFilter) {
    const { table, key } = getTableWithValidation(
      element,
      "toggle row selection",
      "toggleSelectRow"
    );

    try {
      log("debug", "Toggling row selection", {
        key: key,
        rowFilter: rowFilter,
      });
      table.toggleSelectRow(rowFilter);
    } catch (error) {
      log("error", "Error toggling row selection", error);
      throw error;
    }
  }

  // ============================================
  // Public API
  // ============================================

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
    toggleSelectRow,
  };
})();