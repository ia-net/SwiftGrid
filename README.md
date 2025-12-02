# SwiftGrid

SwiftGrid는 Blazor 애플리케이션을 위한 강력하고 유연한 데이터 그리드 컴포넌트입니다. [Tabulator](https://tabulator.info/) 라이브러리를 기반으로 하며, C#과 Razor를 사용하여 쉽게 사용할 수 있습니다.

## 주요 기능

- 📊 **강력한 데이터 그리드**: 대용량 데이터를 효율적으로 표시하고 관리
- 🔍 **검색 및 필터링**: 헤더 필터를 통한 실시간 검색 및 필터링
- 📄 **페이지네이션**: 로컬 및 원격 페이지네이션 지원
- ✏️ **셀 편집**: 인라인 셀 편집 및 Undo/Redo 기능
- 📥 **데이터 내보내기**: CSV, JSON, Excel, PDF, HTML 형식으로 내보내기
- ✅ **행 선택**: 단일/다중 행 선택 및 체크박스 선택
- 📋 **클립보드 지원**: 복사/붙여넣기 기능
- 🎨 **커스터마이징**: 다양한 레이아웃 옵션 및 스타일링

## 설치

### NuGet 패키지

```bash
dotnet add package SwiftGrid
```

### 수동 설치

1. 이 저장소를 클론합니다:

```bash
git clone https://github.com/yourusername/SwiftGrid.git
```

2. 프로젝트를 빌드합니다:

```bash
cd SwiftGrid
dotnet build
```

3. 프로젝트 참조를 추가합니다:

```bash
dotnet add reference path/to/SwiftGrid/SwiftGrid.csproj
```

## 필수 요구사항

- .NET 9.0 이상
- Blazor Server 또는 Blazor WebAssembly
- Tabulator 라이브러리 (프로젝트에 포함되어 있음)

## 빠른 시작

### 1. 기본 사용법

```razor
@using SwiftGrid.Components
@using SwiftGrid.Entities

<SwiftGrid Data="@people" Options="@gridOptions">
    <SwiftGridColumn Field="Id" Title="ID" Sortable="true" />
    <SwiftGridColumn Field="Name" Title="이름" Sortable="true" />
    <SwiftGridColumn Field="Email" Title="이메일" />
    <SwiftGridColumn Field="Age" Title="나이" Sortable="true" />
</SwiftGrid>

@code {
    private List<Person> people = new()
    {
        new Person { Id = 1, Name = "홍길동", Email = "hong@example.com", Age = 30 },
        new Person { Id = 2, Name = "김철수", Email = "kim@example.com", Age = 25 },
        new Person { Id = 3, Name = "이영희", Email = "lee@example.com", Age = 28 }
    };

    private SwiftGridOptions gridOptions = new()
    {
        Height = "400px",
        Pagination = true,
        PaginationSize = 10
    };

    public class Person
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int Age { get; set; }
    }
}
```

### 2. 이벤트 처리

```razor
<SwiftGrid Data="@people" 
           Options="@gridOptions"
           OnRowClicked="HandleRowClick"
           OnCellEdited="HandleCellEdit"
           OnRowSelectionChanged="HandleSelectionChange">
    <!-- 컬럼 정의 -->
</SwiftGrid>

@code {
    private async Task HandleRowClick(Person person)
    {
        // 행 클릭 이벤트 처리
        Console.WriteLine($"Clicked: {person.Name}");
    }

    private async Task HandleCellEdit(CellEditedEventArgs<Person> args)
    {
        // 셀 편집 이벤트 처리
        Console.WriteLine($"Field: {args.Field}, New Value: {args.Value}");
    }

    private async Task HandleSelectionChange(int selectedCount)
    {
        // 선택 변경 이벤트 처리
        Console.WriteLine($"Selected: {selectedCount} rows");
    }
}
```

### 3. 데이터 내보내기

```razor
@using SwiftGrid.Components

<SwiftGrid @ref="gridRef" Data="@people">
    <!-- 컬럼 정의 -->
</SwiftGrid>

<button @onclick="ExportToExcel">Excel로 내보내기</button>
<button @onclick="ExportToCsv">CSV로 내보내기</button>

@code {
    private SwiftGrid<Person>? gridRef;

    private async Task ExportToExcel()
    {
        if (gridRef != null)
        {
            await gridRef.DownloadExcelAsync("export.xlsx");
        }
    }

    private async Task ExportToCsv()
    {
        if (gridRef != null)
        {
            await gridRef.DownloadCsvAsync("export.csv");
        }
    }
}
```

## 고급 기능

### 페이지네이션

```csharp
var options = new SwiftGridOptions
{
    Pagination = true,
    PaginationSize = 20,
    PaginationMode = "local", // 또는 "remote"
    PaginationSizeSelector = true,
    PaginationButtonCount = 5
};
```

### 셀 편집

```razor
<SwiftGridColumn Field="Name" 
                 Title="이름" 
                 Editable="true" 
                 Editor="input" />
<SwiftGridColumn Field="Age" 
                 Title="나이" 
                 Editable="true" 
                 Editor="number" />
<SwiftGridColumn Field="Status" 
                 Title="상태" 
                 Editable="true" 
                 Editor="select"
                 EditorParams="@(new { values = new[] { "Active", "Inactive" } })" />
```

### 헤더 필터

```razor
<SwiftGridColumn Field="Name" 
                 Title="이름" 
                 HeaderFilter="true" 
                 HeaderFilterPlaceholder="이름 검색..." />
<SwiftGridColumn Field="Age" 
                 Title="나이" 
                 HeaderFilter="number" />
```

### 행 선택

```csharp
var options = new SwiftGridOptions
{
    Selectable = 1, // 0 = 비활성화, 1 = 단일 선택
    EnableRowSelectionCheckbox = true,
    RowSelectionRange = "active" // "active", "visible", "all"
};
```

### 히스토리 (Undo/Redo)

```csharp
var options = new SwiftGridOptions
{
    History = true
};

// 코드에서 사용
await gridRef.UndoAsync();
await gridRef.RedoAsync();
var undoCount = await gridRef.GetHistoryUndoSizeAsync();
```

## API 참조

### SwiftGridOptions

| 속성               | 타입        | 기본값           | 설명                              |
| ------------------ | ----------- | ---------------- | --------------------------------- |
| `Layout`         | `string`  | `"fitColumns"` | 테이블 레이아웃 모드              |
| `Height`         | `string?` | `null`         | 테이블 높이 (CSS 값)              |
| `Selectable`     | `int`     | `1`            | 행 선택 모드 (0=비활성화, 1=단일) |
| `Pagination`     | `bool`    | `false`        | 페이지네이션 활성화               |
| `PaginationSize` | `int?`    | `null`         | 페이지당 행 수                    |
| `PaginationMode` | `string`  | `"local"`      | 페이지네이션 모드                 |
| `History`        | `bool`    | `false`        | 편집 히스토리 활성화              |
| `Clipboard`      | `object?` | `null`         | 클립보드 기능 활성화              |

### SwiftGrid 메서드

- `DownloadAsync(string type, string? filename, object? options)` - 데이터 내보내기
- `DownloadCsvAsync(string? filename, bool selectedOnly)` - CSV 내보내기
- `DownloadExcelAsync(string? filename, bool selectedOnly)` - Excel 내보내기
- `DownloadPdfAsync(string? filename, bool selectedOnly)` - PDF 내보내기
- `GetSelectedDataAsync()` - 선택된 행 데이터 가져오기
- `SelectRowAsync(object rowFilter)` - 행 선택
- `DeselectRowAsync(object rowFilter)` - 행 선택 해제
- `UndoAsync()` - 마지막 편집 취소
- `RedoAsync()` - 마지막 취소한 편집 다시 실행
- `CopyToClipboardAsync(string? rowRange)` - 클립보드로 복사

## 예제

더 많은 예제는 `SwiftGrid.Demo` 프로젝트를 참조하세요.

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.


---

## SwiftGrid

SwiftGrid is a powerful and flexible data grid component for Blazor applications. Built on top of the [Tabulator](https://tabulator.info/) library, it provides an easy-to-use interface using C# and Razor.

## Features

- 📊 **Powerful Data Grid**: Efficiently display and manage large datasets
- 🔍 **Search & Filtering**: Real-time search and filtering with header filters
- 📄 **Pagination**: Support for local and remote pagination
- ✏️ **Cell Editing**: Inline cell editing with Undo/Redo functionality
- 📥 **Data Export**: Export to CSV, JSON, Excel, PDF, HTML formats
- ✅ **Row Selection**: Single/multiple row selection with checkbox support
- 📋 **Clipboard Support**: Copy/paste functionality
- 🎨 **Customizable**: Various layout options and styling

## Installation

### NuGet Package

```bash
dotnet add package SwiftGrid
```

### Manual Installation

1. Clone this repository:

```bash
git clone https://github.com/yourusername/SwiftGrid.git
```

2. Build the project:

```bash
cd SwiftGrid
dotnet build
```

3. Add project reference:

```bash
dotnet add reference path/to/SwiftGrid/SwiftGrid.csproj
```

## Requirements

- .NET 9.0 or higher
- Blazor Server or Blazor WebAssembly
- Tabulator library (included in the project)

## Quick Start

### 1. Basic Usage

```razor
@using SwiftGrid.Components
@using SwiftGrid.Entities

<SwiftGrid Data="@people" Options="@gridOptions">
    <SwiftGridColumn Field="Id" Title="ID" Sortable="true" />
    <SwiftGridColumn Field="Name" Title="Name" Sortable="true" />
    <SwiftGridColumn Field="Email" Title="Email" />
    <SwiftGridColumn Field="Age" Title="Age" Sortable="true" />
</SwiftGrid>

@code {
    private List<Person> people = new()
    {
        new Person { Id = 1, Name = "John Doe", Email = "john@example.com", Age = 30 },
        new Person { Id = 2, Name = "Jane Smith", Email = "jane@example.com", Age = 25 },
        new Person { Id = 3, Name = "Bob Johnson", Email = "bob@example.com", Age = 28 }
    };

    private SwiftGridOptions gridOptions = new()
    {
        Height = "400px",
        Pagination = true,
        PaginationSize = 10
    };

    public class Person
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int Age { get; set; }
    }
}
```

### 2. Event Handling

```razor
<SwiftGrid Data="@people" 
           Options="@gridOptions"
           OnRowClicked="HandleRowClick"
           OnCellEdited="HandleCellEdit"
           OnRowSelectionChanged="HandleSelectionChange">
    <!-- Column definitions -->
</SwiftGrid>

@code {
    private async Task HandleRowClick(Person person)
    {
        // Handle row click event
        Console.WriteLine($"Clicked: {person.Name}");
    }

    private async Task HandleCellEdit(CellEditedEventArgs<Person> args)
    {
        // Handle cell edit event
        Console.WriteLine($"Field: {args.Field}, New Value: {args.Value}");
    }

    private async Task HandleSelectionChange(int selectedCount)
    {
        // Handle selection change event
        Console.WriteLine($"Selected: {selectedCount} rows");
    }
}
```

### 3. Data Export

```razor
@using SwiftGrid.Components

<SwiftGrid @ref="gridRef" Data="@people">
    <!-- Column definitions -->
</SwiftGrid>

<button @onclick="ExportToExcel">Export to Excel</button>
<button @onclick="ExportToCsv">Export to CSV</button>

@code {
    private SwiftGrid<Person>? gridRef;

    private async Task ExportToExcel()
    {
        if (gridRef != null)
        {
            await gridRef.DownloadExcelAsync("export.xlsx");
        }
    }

    private async Task ExportToCsv()
    {
        if (gridRef != null)
        {
            await gridRef.DownloadCsvAsync("export.csv");
        }
    }
}
```

## Advanced Features

### Pagination

```csharp
var options = new SwiftGridOptions
{
    Pagination = true,
    PaginationSize = 20,
    PaginationMode = "local", // or "remote"
    PaginationSizeSelector = true,
    PaginationButtonCount = 5
};
```

### Cell Editing

```razor
<SwiftGridColumn Field="Name" 
                 Title="Name" 
                 Editable="true" 
                 Editor="input" />
<SwiftGridColumn Field="Age" 
                 Title="Age" 
                 Editable="true" 
                 Editor="number" />
<SwiftGridColumn Field="Status" 
                 Title="Status" 
                 Editable="true" 
                 Editor="select"
                 EditorParams="@(new { values = new[] { "Active", "Inactive" } })" />
```

### Header Filters

```razor
<SwiftGridColumn Field="Name" 
                 Title="Name" 
                 HeaderFilter="true" 
                 HeaderFilterPlaceholder="Search name..." />
<SwiftGridColumn Field="Age" 
                 Title="Age" 
                 HeaderFilter="number" />
```

### Row Selection

```csharp
var options = new SwiftGridOptions
{
    Selectable = 1, // 0 = disabled, 1 = single selection
    EnableRowSelectionCheckbox = true,
    RowSelectionRange = "active" // "active", "visible", "all"
};
```

### History (Undo/Redo)

```csharp
var options = new SwiftGridOptions
{
    History = true
};

// Usage in code
await gridRef.UndoAsync();
await gridRef.RedoAsync();
var undoCount = await gridRef.GetHistoryUndoSizeAsync();
```

## API Reference

### SwiftGridOptions

| Property           | Type        | Default          | Description                               |
| ------------------ | ----------- | ---------------- | ----------------------------------------- |
| `Layout`         | `string`  | `"fitColumns"` | Table layout mode                         |
| `Height`         | `string?` | `null`         | Table height (CSS value)                  |
| `Selectable`     | `int`     | `1`            | Row selection mode (0=disabled, 1=single) |
| `Pagination`     | `bool`    | `false`        | Enable pagination                         |
| `PaginationSize` | `int?`    | `null`         | Rows per page                             |
| `PaginationMode` | `string`  | `"local"`      | Pagination mode                           |
| `History`        | `bool`    | `false`        | Enable edit history                       |
| `Clipboard`      | `object?` | `null`         | Enable clipboard functionality            |

### SwiftGrid Methods

- `DownloadAsync(string type, string? filename, object? options)` - Export data
- `DownloadCsvAsync(string? filename, bool selectedOnly)` - Export to CSV
- `DownloadExcelAsync(string? filename, bool selectedOnly)` - Export to Excel
- `DownloadPdfAsync(string? filename, bool selectedOnly)` - Export to PDF
- `GetSelectedDataAsync()` - Get selected row data
- `SelectRowAsync(object rowFilter)` - Select row
- `DeselectRowAsync(object rowFilter)` - Deselect row
- `UndoAsync()` - Undo last edit
- `RedoAsync()` - Redo last undone edit
- `CopyToClipboardAsync(string? rowRange)` - Copy to clipboard

## Examples

See the `SwiftGrid.Demo` project for more examples.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

This project is built on top of the [Tabulator](https://tabulator.info/) library.
