// SwiftGrid - Blazor wrapper for Tabulator
window.swiftGrid = (function () {
  "use strict";

  // Constants
  const MODULE_NAME = "SwiftGrid";
  const DEFAULT_LAYOUT = "fitColumns";
  const DEFAULT_PAGINATION_MODE = "local";
  const DEFAULT_PAGINATION_COUNTER = "rows";
  const CHECKBOX_COLUMN_WIDTH = 50;
  const CHECKBOX_COLUMN_ALIGN = "center";
  const CHECKBOX_COLUMN_VERT_ALIGN = "middle";
  const DEFAULT_CLIPBOARD_ROW_RANGE = "selected";
  const FALLBACK_CLIPBOARD_ROW_RANGE = "active";
  const CLIPBOARD_RESTORE_DELAY = 100;
  const DEFAULT_FILTER_TYPE = "like";
  const SEARCH_CASE_SENSITIVE = false;
  const KEY_CODE_C = 67;
  const QUERY_CHANGE_NOTIFICATION_DELAY = 50;
  const INITIAL_QUERY_NOTIFICATION_DELAY = 100;
  const DEFAULT_PAGE = 1;
  const DEFAULT_PAGE_SIZE = 10;

  const FILTER_TYPE_MAP = {
    "=": "eq", "==": "eq", "!=": "neq", "!==": "neq",
    "like": "like", "regex": "like",
    ">": "gt", ">=": "gte", "<": "lt", "<=": "lte",
    "in": "in", "nin": "nin",
  };

  const PROCESSED_COLUMN_PROPERTIES = new Set([
    "field", "title", "sortable", "visible", "width", "formatter",
    "headerfilter", "headerfilterplaceholder", "headerfilterparams",
    "editable", "editor", "editorparams",
  ]);

  // Module State
  const tables = new Map();

  // Utility Functions

  /** 로그 출력 */
  function log(level, message, data) {
    if (!console || typeof console[level] !== "function") return;
    const prefix = `[${MODULE_NAME}]`;
    if (data !== undefined) {
      console[level](`${prefix} ${message}`, data);
    } else {
      console[level](`${prefix} ${message}`);
    }
  }

  /** 요소의 고유 키 가져오기 */
  function getKey(element) {
    if (!element) return null;
    return element.id || element;
  }

  /** C# 객체 속성 가져오기 (PascalCase/camelCase 지원) */
  function getProperty(obj, camelKey, pascalKey, defaultValue) {
    if (obj?.[camelKey] !== undefined) return obj[camelKey];
    if (obj?.[pascalKey] !== undefined) return obj[pascalKey];
    return defaultValue;
  }

  /** 테이블 인스턴스 조회 */
  function getTable(element) {
    const key = getKey(element);
    if (!key) return null;
    const table = tables.get(key);
    if (!table) return null;
    return { table, key };
  }

  /** 테이블 조회 및 유효성 검사 */
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

  /** 필드명을 camelCase로 정규화 */
  function normalizeFieldName(field) {
    if (!field || typeof field !== "string") return field;
    return field.charAt(0).toLowerCase() + field.slice(1);
  }

  /** 속성을 안전하게 설정 */
  function setPropertyIfNotNull(target, key, value, defaultValue = null) {
    if (value !== null && value !== undefined) {
      target[key] = value;
    } else if (defaultValue !== null) {
      target[key] = defaultValue;
    }
  }

  /** DotNet 호출을 안전하게 실행하는 헬퍼 */
  function safeInvokeDotNet(dotNetRef, methodName, data, errorMessage) {
    if (!dotNetRef) {
      log("warn", `DotNetRef is null, cannot invoke ${methodName}`);
      return;
    }
    if (typeof dotNetRef.invokeMethodAsync !== "function") {
      log("warn", `DotNetRef.invokeMethodAsync is not a function. Cannot invoke ${methodName}`);
      return;
    }
    try {
      dotNetRef.invokeMethodAsync(methodName, data).catch((err) => {
        log("error", errorMessage || `Error invoking ${methodName}`, err);
      });
    } catch (error) {
      log("error", errorMessage || `Error in ${methodName}`, error);
    }
  }

  // Column Conversion Functions

  /** 컬럼 정의를 Tabulator 형식으로 변환 */
  function convertColumns(columns) {
    if (!columns?.length) return [];

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

      setPropertyIfNotNull(tabCol, "width", getProperty(col, "width", "Width", null));
      setPropertyIfNotNull(tabCol, "formatter", getProperty(col, "formatter", "Formatter", null));

      const headerFilter = getProperty(col, "headerFilter", "HeaderFilter", null);
      if (headerFilter !== null && headerFilter !== undefined) {
        tabCol.headerFilter = headerFilter === true ? "input" : headerFilter;
      }

      setPropertyIfNotNull(tabCol, "headerFilterPlaceholder", 
        getProperty(col, "headerFilterPlaceholder", "HeaderFilterPlaceholder", null));
      setPropertyIfNotNull(tabCol, "headerFilterParams", 
        getProperty(col, "headerFilterParams", "HeaderFilterParams", null));

      const editable = getProperty(col, "editable", "Editable", null);
      if (editable !== null && editable !== undefined) {
        tabCol.editable = editable === true ? true : editable;
      }

      setPropertyIfNotNull(tabCol, "editor", getProperty(col, "editor", "Editor", null));
      setPropertyIfNotNull(tabCol, "editorParams", 
        getProperty(col, "editorParams", "EditorParams", null));

      // Tabulator가 인식하는 추가 속성만 복사 (데이터 객체 속성 제외)
      const TABULATOR_COLUMN_PROPERTIES = new Set([
        "field", "title", "headerSort", "visible", "width", "formatter",
        "headerFilter", "headerFilterPlaceholder", "headerFilterParams",
        "editable", "editor", "editorParams", "hozAlign", "vertAlign",
        "headerHozAlign", "headerVertAlign", "frozen", "resizable",
        "cellClick", "formatterParams", "titleFormatter", "titleFormatterParams"
      ]);

      Object.keys(col).forEach((key) => {
        const lowerKey = key.toLowerCase();
        if (!PROCESSED_COLUMN_PROPERTIES.has(lowerKey) && 
            !tabCol.hasOwnProperty(key) &&
            TABULATOR_COLUMN_PROPERTIES.has(lowerKey)) {
          tabCol[key] = col[key];
        }
      });

      return tabCol;
    });
  }

  /** 체크박스 컬럼 정의 생성 */
  function createCheckboxColumn(rowRange) {
    return {
      formatter: "rowSelection",
      titleFormatter: "rowSelection",
      formatterParams: { rowRange: rowRange },
      titleFormatterParams: { rowRange: rowRange },
      cellClick: function (e, cell) {
        if (e.target && (e.target.type === "checkbox" || e.target.closest('input[type="checkbox"]'))) {
          return;
        }
        const row = cell.getRow();
        if (row) row.toggleSelect();
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

  // Options Conversion Functions

  /** 페이지네이션 옵션 변환 */
  function convertPaginationOptions(options, tabOptions) {
    const pagination = getProperty(options, "pagination", "Pagination", false);
    if (!pagination) return;

    tabOptions.pagination = pagination === true ? DEFAULT_PAGINATION_MODE : pagination;

    setPropertyIfNotNull(tabOptions, "paginationSize", 
      getProperty(options, "paginationSize", "PaginationSize", null));
    setPropertyIfNotNull(tabOptions, "paginationMode", 
      getProperty(options, "paginationMode", "PaginationMode", null));

    const paginationCounter = getProperty(options, "paginationCounter", "PaginationCounter", null);
    if (paginationCounter !== null && paginationCounter !== false) {
      tabOptions.paginationCounter = paginationCounter === true 
        ? DEFAULT_PAGINATION_COUNTER 
        : paginationCounter;
    } else if (paginationCounter === false) {
      tabOptions.paginationCounter = false;
    }

    setPropertyIfNotNull(tabOptions, "paginationSizeSelector", 
      getProperty(options, "paginationSizeSelector", "PaginationSizeSelector", null));
    setPropertyIfNotNull(tabOptions, "paginationButtonCount", 
      getProperty(options, "paginationButtonCount", "PaginationButtonCount", null));
  }

  /** 행 클릭 이벤트 핸들러 생성 */
  function createRowClickHandler(dotNetRef) {
    return function (e, row) {
      if (!dotNetRef) return;
      try {
        const rowData = row.getData();
        safeInvokeDotNet(dotNetRef, "HandleRowClicked", rowData, "Error invoking row click callback");
      } catch (error) {
        log("error", "Error in row click handler", error);
      }
    };
  }

  /** 셀 편집 완료 이벤트 핸들러 생성 */
  function createCellEditedHandler(dotNetRef) {
    return function (cell) {
      if (!dotNetRef) return;
      try {
        const cellComponent = typeof cell.getComponent === "function" ? cell.getComponent() : cell;
        const cellData = {
          field: cellComponent.getField(),
          value: cellComponent.getValue(),
          oldValue: typeof cellComponent.getOldValue === "function" 
            ? cellComponent.getOldValue() 
            : null,
          row: cellComponent.getRow().getData(),
        };
        safeInvokeDotNet(dotNetRef, "HandleCellEdited", cellData, "Error invoking cell edited callback");
      } catch (error) {
        log("error", "Error in cell edited handler", error);
      }
    };
  }

  /** 기본 행 컨텍스트 메뉴 생성 */
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
      { separator: true },
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

  /** C# 옵션 객체를 Tabulator 형식으로 변환 */
  function convertOptions(options, dotNetRef) {
    const tabOptions = {
      layout: getProperty(options, "layout", "Layout", DEFAULT_LAYOUT),
      height: getProperty(options, "height", "Height", null),
      selectable: getProperty(options, "selectable", "Selectable", 1),
      rowClick: createRowClickHandler(dotNetRef),
    };

    convertPaginationOptions(options, tabOptions);

    setPropertyIfNotNull(tabOptions, "history", getProperty(options, "history", "History", false));
    setPropertyIfNotNull(tabOptions, "editTriggerEvent", 
      getProperty(options, "editTriggerEvent", "EditTriggerEvent", null));
    setPropertyIfNotNull(tabOptions, "clipboard", 
      getProperty(options, "clipboard", "Clipboard", null));

    const clipboardCopyRowRange = getProperty(options, "clipboardCopyRowRange", 
      "ClipboardCopyRowRange", DEFAULT_CLIPBOARD_ROW_RANGE);
    tabOptions.clipboardCopyRowRange = clipboardCopyRowRange || DEFAULT_CLIPBOARD_ROW_RANGE;

    const enableRowContextMenu = getProperty(options, "enableRowContextMenu", 
      "EnableRowContextMenu", false);
    if (enableRowContextMenu) {
      tabOptions.rowContextMenu = createDefaultRowContextMenu();
    }

    if (dotNetRef) {
      tabOptions.cellEdited = createCellEditedHandler(dotNetRef);
    }

    return tabOptions;
  }

  // Event Handlers

  /** 클립보드 복사 이벤트 핸들러 설정 */
  function setupClipboardFallbackHandler(table) {
    if (!table.modExists("clipboard") || !table.modExists("selectRow")) return;

    const keydownHandler = function (e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.keyCode === KEY_CODE_C)) {
        const selectedRows = table.modules.selectRow.selectedRows;
        if ((!selectedRows || selectedRows.length === 0) &&
            table.modules.clipboard.rowRange === DEFAULT_CLIPBOARD_ROW_RANGE) {
          table.modules.clipboard.rowRange = FALLBACK_CLIPBOARD_ROW_RANGE;
          setTimeout(function () {
            table.modules.clipboard.rowRange = DEFAULT_CLIPBOARD_ROW_RANGE;
          }, CLIPBOARD_RESTORE_DELAY);
        }
      }
    };

    table.element.addEventListener("keydown", keydownHandler);
  }

  /** 행 선택 변경 이벤트 핸들러 설정 */
  function setupRowSelectionChangedHandler(table, dotNetRef) {
    if (!dotNetRef) return;

    table.on("rowSelectionChanged", function (selectedData) {
      if (!dotNetRef) return;
      safeInvokeDotNet(dotNetRef, "HandleRowSelectionChanged", selectedData?.length || 0,
        "Error invoking row selection changed callback");
    });
  }

  /** 필터 타입을 SwiftGrid 연산자로 변환 */
  function mapFilterTypeToOperator(tabulatorType) {
    return FILTER_TYPE_MAP[tabulatorType] || tabulatorType || "eq";
  }

  /** 페이지네이션 정보 수집 */
  function getPaginationInfo(table) {
    const result = { Page: DEFAULT_PAGE, PageSize: DEFAULT_PAGE_SIZE };
    if (!table.modExists("page")) return result;

    const page = table.getPage();
    const pageSize = table.getPageSize();

    if (page !== false && typeof page === "number") result.Page = page;
    if (pageSize !== false && typeof pageSize === "number") result.PageSize = pageSize;

    return result;
  }

  /** 정렬 정보 수집 */
  function getSortInfo(table) {
    const sorters = table.getSorters();
    if (!Array.isArray(sorters)) return [];
    return sorters.map((sorter) => ({
      Field: sorter.field || "",
      Dir: sorter.dir === "desc" ? "desc" : "asc",
    }));
  }

  /** 필터 정보 수집 */
  function getFilterInfo(table) {
    const filters = table.getFilters(true);
    if (!Array.isArray(filters)) return [];
    return filters
      .filter((filter) => filter.field && filter.type !== undefined)
      .map((filter) => ({
        Field: filter.field || "",
        Op: mapFilterTypeToOperator(filter.type),
        Value: filter.value,
      }));
  }

  /** 쿼리 상태 수집 */
  function getQueryState(table, globalSearch) {
    return {
      Page: getPaginationInfo(table).Page,
      PageSize: getPaginationInfo(table).PageSize,
      Sorts: getSortInfo(table),
      Filters: getFilterInfo(table),
      GlobalSearch: globalSearch || null,
    };
  }

  /** 쿼리 상태 변경 이벤트 핸들러 설정 */
  function setupQueryChangedHandler(table, dotNetRef, queryState) {
    if (!dotNetRef) return;

    const notifyQueryChanged = function () {
      if (!dotNetRef) {
        log("warn", "DotNetRef is null, cannot notify query changed");
        return;
      }
      try {
        const query = getQueryState(table, queryState.globalSearch);
        log("debug", "Notifying query changed", query);
        safeInvokeDotNet(dotNetRef, "HandleQueryChanged", query, "Error invoking query changed callback");
      } catch (error) {
        log("error", "Error in query changed handler", error);
      }
    };

    if (table.modExists("page")) {
      table.on("pageLoaded", notifyQueryChanged);
      table.on("pageSizeChanged", notifyQueryChanged);
    }

    table.on("dataSorted", notifyQueryChanged);
    table.on("dataFiltered", notifyQueryChanged);
    
    table.on("headerFilterChanged", function(column, value) {
      log("debug", "Header filter changed", { column: column?.getField(), value: value });
      setTimeout(notifyQueryChanged, QUERY_CHANGE_NOTIFICATION_DELAY);
    });

    setTimeout(notifyQueryChanged, INITIAL_QUERY_NOTIFICATION_DELAY);
  }

  // Table Initialization

  /** Tabulator 테이블 초기화 */
  function initTable(element, dotNetRef, options, data, columns) {
    if (!element) {
      log("error", "Invalid element provided for table initialization");
      throw new Error("Invalid element provided for table initialization");
    }

    const key = getKey(element);
    if (key && tables.has(key)) {
      log("warn", `Table with key '${key}' already exists. Destroying existing table.`);
      destroyTable(element);
    }

    let convertedColumns = convertColumns(columns);
    const tableData = Array.isArray(data) ? data : [];

    const enableCheckbox = getProperty(options, "enableRowSelectionCheckbox", 
      "EnableRowSelectionCheckbox", false);
    if (enableCheckbox) {
      const rowSelectionRange = getProperty(options, "rowSelectionRange", 
        "RowSelectionRange", FALLBACK_CLIPBOARD_ROW_RANGE);
      const finalRange = rowSelectionRange || FALLBACK_CLIPBOARD_ROW_RANGE;
      const checkboxColumn = createCheckboxColumn(finalRange);
      convertedColumns = [checkboxColumn, ...convertedColumns];
      log("debug", "Row selection checkbox column added", { rowRange: finalRange });
    }

    log("debug", "Initializing table", {
      key: key,
      dataCount: tableData.length,
      columnsCount: convertedColumns.length,
      hasData: tableData.length > 0,
      checkboxEnabled: enableCheckbox,
    });

    if (!window.Tabulator) {
      log("error", "Tabulator library is not loaded. Make sure tabulator.min.js is included before swiftgrid.js");
      throw new Error("Tabulator library is not loaded");
    }

    try {
      const tabulatorOptions = {
        data: tableData,
        columns: convertedColumns,
        ...convertOptions(options, dotNetRef),
      };

      const table = new Tabulator(element, tabulatorOptions);
      const queryState = { globalSearch: null };

      table.on("tableBuilt", function () {
        setupClipboardFallbackHandler(table);
        if (enableCheckbox) {
          setupRowSelectionChangedHandler(table, dotNetRef);
        }
        setupQueryChangedHandler(table, dotNetRef, queryState);
      });

      if (key) {
        tables.set(key, table);
        if (!tables.has(key + "_queryState")) {
          tables.set(key + "_queryState", queryState);
        }
      } else {
        tables.set(element, table);
        tables.set(element + "_queryState", queryState);
      }

      log("info", "Table initialized successfully", { key: key });
    } catch (error) {
      log("error", "Failed to initialize Tabulator", error);
      throw error;
    }
  }

  // Table Data Operations

  /** 테이블 데이터 업데이트 */
  function setData(element, data) {
    const { table, key } = getTableWithValidation(element, "update data");
    const tableData = Array.isArray(data) ? data : [];
    log("debug", "Updating table data", { key: key, dataCount: tableData.length });

    try {
      table.replaceData(tableData);
    } catch (error) {
      log("error", "Failed to update table data", error);
      throw error;
    }
  }

  // Table Lifecycle

  /** 테이블 제거 */
  function destroyTable(element) {
    const result = getTable(element);
    if (!result) return;

    const { table, key } = result;
    try {
      table.destroy();
      log("debug", "Table destroyed", { key: key });
    } catch (error) {
      log("error", "Error destroying table", error);
    } finally {
      tables.delete(key);
      tables.delete(key + "_queryState");
    }
  }

  // Export Functions

  /** 테이블 데이터 다운로드 */
  function download(element, type, filename, options) {
    const { table, key } = getTableWithValidation(element, "download", "download");

    try {
      const finalFilename = filename || `export.${type}`;
      log("debug", `Downloading as ${type}`, { filename: finalFilename });
      table.download(type, finalFilename, options || {});
    } catch (error) {
      log("error", `Error downloading file as ${type}`, error);
      throw error;
    }
  }

  /** HTML 문자열 반환 */
  function getHtml(element, options) {
    const result = getTable(element);
    if (!result) {
      log("warn", `Table with key '${getKey(element)}' not found. Cannot get HTML.`);
      return "";
    }

    const { table } = result;
    if (typeof table.getHtml !== "function") {
      log("error", "getHtml method not available. Make sure Tabulator export module is loaded.");
      return "";
    }

    try {
      return table.getHtml(options || {});
    } catch (error) {
      log("error", "Error getting HTML", error);
      throw error;
    }
  }

  /** 테이블 인쇄 */
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

  // Filter Functions

  /** 필터 설정 */
  function setFilter(element, filter, type, value) {
    const { table, key } = getTableWithValidation(element, "set filter", "setFilter");
    try {
      log("debug", "Setting filter", { key: key, filter: filter, type: type, value: value });
      table.setFilter(filter, type, value);
    } catch (error) {
      log("error", "Error setting filter", error);
      throw error;
    }
  }

  /** 모든 필터 제거 */
  function clearFilter(element) {
    const { table, key } = getTableWithValidation(element, "clear filter", "setFilter");
    try {
      log("debug", "Clearing all filters", { key: key });
      if (typeof table.clearFilter === "function") {
        table.clearFilter(true);
      } else {
        table.setFilter(false);
      }
    } catch (error) {
      log("error", "Error clearing filter", error);
      throw error;
    }
  }

  /** 모든 컬럼에서 전역 검색 */
  function searchAll(element, searchValue, filterType) {
    const { table, key } = getTableWithValidation(element, "search", "setFilter");

    try {
      const queryStateKey = key + "_queryState";
      const queryState = tables.get(queryStateKey) || { globalSearch: null };

      if (!searchValue || searchValue.trim() === "") {
        if (typeof table.clearFilter === "function") {
          table.clearFilter(true);
        } else {
          table.setFilter(false);
        }
        queryState.globalSearch = null;
        log("debug", "Search cleared (empty value)", { key: key });
        return;
      }

      const columns = table.getColumns();
      const fieldNames = [];
      for (let i = 0; i < columns.length; i++) {
        const field = columns[i].getField();
        if (field) fieldNames.push(field);
      }

      if (fieldNames.length === 0) {
        log("warn", "No columns found for search", { key: key });
        return;
      }

      const searchLower = SEARCH_CASE_SENSITIVE 
        ? String(searchValue) 
        : String(searchValue).toLowerCase();

      table.setFilter(function (data) {
        for (let i = 0; i < fieldNames.length; i++) {
          const fieldValue = data[fieldNames[i]];
          if (fieldValue != null) {
            const fieldStr = SEARCH_CASE_SENSITIVE 
              ? String(fieldValue) 
              : String(fieldValue).toLowerCase();
            if (fieldStr.indexOf(searchLower) !== -1) return true;
          }
        }
        return false;
      });

      queryState.globalSearch = searchValue;
      if (!tables.has(queryStateKey)) {
        tables.set(queryStateKey, queryState);
      }

      log("debug", "Searching all columns", {
        key: key,
        value: searchValue,
        type: filterType || DEFAULT_FILTER_TYPE,
        columns: fieldNames.length,
      });
    } catch (error) {
      log("error", "Error performing search", error);
      throw error;
    }
  }

  // History Functions

  /** Undo */
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

  /** Redo */
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

  /** Undo 가능한 히스토리 항목 수 반환 */
  function getHistoryUndoSize(element) {
    const result = getTable(element);
    if (!result || typeof result.table.getHistoryUndoSize !== "function") return 0;
    try {
      return result.table.getHistoryUndoSize() || 0;
    } catch (error) {
      log("error", "Error getting undo size", error);
      return 0;
    }
  }

  /** Redo 가능한 히스토리 항목 수 반환 */
  function getHistoryRedoSize(element) {
    const result = getTable(element);
    if (!result || typeof result.table.getHistoryRedoSize !== "function") return 0;
    try {
      return result.table.getHistoryRedoSize() || 0;
    } catch (error) {
      log("error", "Error getting redo size", error);
      return 0;
    }
  }

  // Clipboard Functions

  /** 클립보드로 복사 */
  function copyToClipboard(element, rowRange) {
    const { table, key } = getTableWithValidation(element, "copy to clipboard", "copyToClipboard");
    try {
      const range = rowRange || DEFAULT_CLIPBOARD_ROW_RANGE;
      log("debug", "Copying to clipboard", { key: key, rowRange: range });
      table.copyToClipboard(range);
    } catch (error) {
      log("error", "Error copying to clipboard", error);
      throw error;
    }
  }

  // Row Selection Functions

  /** 선택된 행의 데이터 가져오기 */
  function getSelectedData(element) {
    const result = getTable(element);
    if (!result) {
      log("warn", `Table with key '${getKey(element)}' not found. Cannot get selected data.`);
      return [];
    }

    const { table } = result;
    if (typeof table.getSelectedData !== "function") {
      log("warn", "getSelectedData method not available. Make sure Tabulator selectRow module is loaded.");
      return [];
    }

    try {
      return table.getSelectedData() || [];
    } catch (error) {
      log("error", "Error getting selected data", error);
      return [];
    }
  }

  /** 선택된 행 객체 가져오기 */
  function getSelectedRows(element) {
    const result = getTable(element);
    if (!result) {
      log("warn", `Table with key '${getKey(element)}' not found. Cannot get selected rows.`);
      return [];
    }

    const { table } = result;
    if (typeof table.getSelectedRows !== "function") {
      log("warn", "getSelectedRows method not available. Make sure Tabulator selectRow module is loaded.");
      return [];
    }

    try {
      const rows = table.getSelectedRows() || [];
      return rows.map((row) => row.getData());
    } catch (error) {
      log("error", "Error getting selected rows", error);
      return [];
    }
  }

  /** 행 선택 */
  function selectRow(element, rowFilter) {
    const { table, key } = getTableWithValidation(element, "select row", "selectRow");
    try {
      log("debug", "Selecting row", { key: key, rowFilter: rowFilter });
      table.selectRow(rowFilter);
    } catch (error) {
      log("error", "Error selecting row", error);
      throw error;
    }
  }

  /** 행 선택 해제 */
  function deselectRow(element, rowFilter) {
    const { table, key } = getTableWithValidation(element, "deselect row", "deselectRow");
    try {
      log("debug", "Deselecting row", { key: key, rowFilter: rowFilter });
      table.deselectRow(rowFilter);
    } catch (error) {
      log("error", "Error deselecting row", error);
      throw error;
    }
  }

  /** 행 선택 토글 */
  function toggleSelectRow(element, rowFilter) {
    const { table, key } = getTableWithValidation(element, "toggle row selection", "toggleSelectRow");
    try {
      log("debug", "Toggling row selection", { key: key, rowFilter: rowFilter });
      table.toggleSelectRow(rowFilter);
    } catch (error) {
      log("error", "Error toggling row selection", error);
      throw error;
    }
  }

  // Row Management Functions

  /** 행 삭제 */
  function deleteRow(element, rowFilter) {
    const { table, key } = getTableWithValidation(element, "delete row", "deleteRow");
    try {
      log("debug", "Deleting row", { key: key, rowFilter: rowFilter });
      table.deleteRow(rowFilter);
    } catch (error) {
      log("error", "Error deleting row", error);
      throw error;
    }
  }

  // Public API
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
    deleteRow,
  };
})();
