<h1 align="center">
    <img src="SwiftGrid.Demo/wwwroot/assets/swiftgrid_logo.png"
         alt="SwiftGrid Logo"
         width="26"
         style="position: relative; top: 1px;" />
    SwiftGrid
</h1>

<p align="center">
  <strong>Tabulator 기반 Razor 컴포넌트</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Framework-Blazor-5C2D91?logo=blazor&logoColor=white" />
  <img src="https://img.shields.io/badge/Tabulator-6.x-blue" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" />
</p>

Tabulator의 기능을 C#과 Razor로 쉽게 사용할 수 있는 Blazor 컴포넌트입니다 🙂

---

## 📦 설치

### 1. 프로젝트 참조 추가

`.csproj` 파일에 추가:

```xml
<ItemGroup>
    <ProjectReference Include="..\SwiftGrid\SwiftGrid.csproj" />
</ItemGroup>
```

### 2. 네임스페이스 추가

`_Imports.razor` 파일에 추가:

```razor
@using SwiftGrid.Components
@using SwiftGrid.Entities
```

### 3. 스크립트 및 스타일 추가

`App.razor` 또는 `_Host.cshtml`에 추가:

```html
<link rel="stylesheet" href="_content/SwiftGrid/lib/tabulator/css/tabulator.min.css" />
<script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>
<script src="_content/SwiftGrid/lib/tabulator/js/tabulator.min.js"></script>
<script src="_content/SwiftGrid/js/swiftgrid.js"></script>
```

---

## ✨ 사용법

### 기본 예시

```razor
<SwiftGrid TItem="Person" Data="@people">
    <SwiftGridColumn TItem="Person" Field="Id" Title="ID" Sortable="true" Width="80" />
    <SwiftGridColumn TItem="Person" Field="Name" Title="이름" Sortable="true" HeaderFilter="true" />
    <SwiftGridColumn TItem="Person" Field="Age" Title="나이" Sortable="true" HeaderFilter="true" />
    <SwiftGridColumn TItem="Person" Field="Email" Title="이메일" HeaderFilter="true" />
</SwiftGrid>

@code {
    private List<Person> people = new()
    {
        new Person { Id = 1, Name = "홍길동", Age = 24, Email = "hong@test.com" },
        new Person { Id = 2, Name = "김철수", Age = 31, Email = "kim@test.com" }
    };
}
```

### 페이지네이션

```razor
<SwiftGrid TItem="Person" Data="@people" Options="@gridOptions">
    <!-- 컬럼 정의 -->
</SwiftGrid>

@code {
    private SwiftGridOptions gridOptions = new()
    {
        Pagination = true,
        PaginationSize = 10,
        PaginationCounter = true,
        PaginationSizeSelector = true
    };
}
```

### 이벤트 처리

```razor
<SwiftGrid TItem="Person" 
           Data="@people" 
           OnRowClicked="HandleRowClick"
           OnCellEdited="HandleCellEdit"
           OnQueryChanged="HandleQueryChange">
    <!-- 컬럼 정의 -->
</SwiftGrid>

@code {
    private async Task HandleRowClick(Person person) { }
    private async Task HandleCellEdit(CellEditedEventArgs<Person> args) { }
    private async Task HandleQueryChange(SwiftGridQuery query) { }
}
```

### 셀 편집

```razor
<SwiftGrid TItem="Person" Data="@people" Options="@gridOptions" OnCellEdited="HandleCellEdit">
    <SwiftGridColumn TItem="Person" Field="Name" Title="이름" Editable="true" Editor="input" />
    <SwiftGridColumn TItem="Person" Field="Age" Title="나이" Editable="true" Editor="number" />
</SwiftGrid>

@code {
    private SwiftGridOptions gridOptions = new() { History = true };
}
```

### 서버 사이드 페이지네이션

```razor
<SwiftGrid TItem="Person" 
           Data="@filteredPeople" 
           TotalCount="@totalCount"
           Options="@gridOptions" 
           OnQueryChanged="HandleQueryChange">
    <!-- 컬럼 정의 -->
</SwiftGrid>

@code {
    private SwiftGridOptions gridOptions = new()
    {
        Pagination = true,
        PaginationSize = 10,
        PaginationMode = "remote"
    };

    private async Task HandleQueryChange(SwiftGridQuery query)
    {
        var result = await apiService.GetPeopleAsync(query);
        filteredPeople = result.Items;
        totalCount = result.TotalCount;
    }
}
```

---

## 📚 주요 기능

- 정렬, 필터링, 페이지네이션
- 셀 편집 및 Undo/Redo
- 행 선택 (단일/다중)
- 데이터 내보내기 (CSV, Excel, JSON, PDF)
- 전역 검색
- 쿼리 상태 모니터링

---

## 📖 API

- `SwiftGrid<TItem>`: 메인 그리드 컴포넌트
- `SwiftGridColumn<TItem>`: 컬럼 정의
- `SwiftGridOptions`: 그리드 옵션
- `SwiftGridQuery`: 쿼리 상태
- `SwiftGridFilter`: 필터 정보
- `SwiftGridSort`: 정렬 정보
- `CellEditedEventArgs<TItem>`: 셀 편집 이벤트

---

## 🚀 데모

```bash
cd SwiftGrid.Demo
dotnet run
```
