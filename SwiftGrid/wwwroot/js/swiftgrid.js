// SwiftGrid JavaScript Module
window.swiftGrid = (function () {
    'use strict';
    
    const tables = new Map();

    /**
     * 요소의 고유 키를 가져옵니다.
     * @param {Element|string} element - DOM 요소 또는 요소 참조
     * @returns {string|Element} 요소의 ID 또는 요소 자체
     */
    function getKey(element) {
        return element?.id || element;
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

            // 추가 속성 동적 복사
            Object.keys(col).forEach(key => {
                const lowerKey = key.toLowerCase();
                if (!['field', 'title', 'sortable', 'visible', 'width', 'formatter'].includes(lowerKey) &&
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
    function convertOptions(options, dotNetRef) {
        return {
            layout: getProperty(options, 'layout', 'Layout', 'fitColumns'),
            height: getProperty(options, 'height', 'Height', null),
            selectable: getProperty(options, 'selectable', 'Selectable', 1),
            rowClick: (e, row) => {
                if (dotNetRef) {
                    const rowData = row.getData();
                    dotNetRef.invokeMethodAsync('HandleRowClicked', rowData);
                }
            }
        };
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
            console.error('SwiftGrid: Invalid element provided');
            return;
        }

        const key = getKey(element);
        if (tables.has(key)) {
            console.warn(`SwiftGrid: Table with key '${key}' already exists. Destroying existing table.`);
            destroyTable(element);
        }

        const convertedColumns = convertColumns(columns);
        const tableData = Array.isArray(data) ? data : [];

        if (console?.debug) {
            console.debug('SwiftGrid: Initializing table', {
                dataCount: tableData.length,
                columnsCount: convertedColumns.length,
                hasData: tableData.length > 0,
                columns: convertedColumns,
                firstDataRow: tableData[0] || null
            });
        }

        try {
            const table = new Tabulator(element, {
                data: tableData,
                columns: convertedColumns,
                ...convertOptions(options, dotNetRef)
            });
            tables.set(key, table);
        } catch (error) {
            console.error('SwiftGrid: Failed to initialize Tabulator', error);
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
            console.warn(`SwiftGrid: Table with key '${key}' not found`);
            return;
        }

        const tableData = Array.isArray(data) ? data : [];
        
        if (console?.debug) {
            console.debug('SwiftGrid: Updating table data', {
                dataCount: tableData.length,
                hasData: tableData.length > 0
            });
        }

        table.replaceData(tableData);
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
            } catch (error) {
                console.error('SwiftGrid: Error destroying table', error);
            }
            tables.delete(key);
        }
    }

    return {
        initTable,
        setData,
        destroyTable
    };
})();
