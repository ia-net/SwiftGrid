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

SwiftGrid는 Tabulator의 강력한 기능을 그대로 활용하면서,  
C#과 Razor만으로 가볍게 그리드를 구성할 수 있도록 만든 작은 컴포넌트입니다.  
가볍게 그냥 가져다 쓰는 느낌을 목표로 하고 있어요🙂

---

## 📦 설치

SwiftGrid는 별도 NuGet 패키지 없이  
레포지토리의 `SwiftGrid` 프로젝트를 직접 ProjectReference로 연결해 사용합니다.

### 1. 프로젝트 참조 추가

`.csproj` 파일에 다음을 추가합니다:

```xml
<ItemGroup>
    <ProjectReference Include="..\SwiftGrid\SwiftGrid.csproj" />
</ItemGroup>
```

### 2. 네임스페이스 추가

`_Imports.razor` 파일에 다음을 추가합니다:

```razor
@using SwiftGrid.Components
@using SwiftGrid.Entities
```

### 3. 필요한 스크립트 및 스타일 추가

`App.razor` 또는 `_Host.cshtml`에 다음을 추가합니다:

```html
<!-- Tabulator CSS -->
<link rel="stylesheet" href="_content/SwiftGrid/lib/tabulator/css/tabulator.min.css" />

<!-- Tabulator JS (XLSX 라이브러리보다 먼저 로드) -->
<script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>
<script src="_content/SwiftGrid/lib/tabulator/js/tabulator.min.js"></script>
<script src="_content/SwiftGrid/js/swiftgrid.js"></script>
```

---

## ✨ 기본 사용법

### 간단한 예시

```razor
@page "/people"
@using SwiftGrid.Components
@using SwiftGrid.Entities

<h3>사람 목록</h3>

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
        new Person { Id = 2, Name = "김철수", Age = 31, Email = "kim@test.com" },
        new Person { Id = 3, Name = "이영희", Age = 28, Email = "lee@test.com" }
    };

    public class Person
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public int Age { get; set; }
        public string Email { get; set; } = "";
    }
}
```

### 페이지네이션 사용

```razor
<SwiftGrid TItem="Person" Data="@people" Options="@gridOptions">
    <!-- 컬럼 정의 -->
</SwiftGrid>

@code {
    private SwiftGridOptions gridOptions = new()
    {
        Layout = "fitColumns",
        Height = "400px",
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
    private async Task HandleRowClick(Person person)
    {
        Console.WriteLine($"선택된 사람: {person.Name}");
    }

    private async Task HandleCellEdit(CellEditedEventArgs<Person> args)
    {
        Console.WriteLine($"{args.Field}: {args.OldValue} → {args.Value}");
        // 데이터베이스에 저장하는 로직 등
    }

    private async Task HandleQueryChange(SwiftGridQuery query)
    {
        Console.WriteLine($"페이지: {query.Page}, 페이지 크기: {query.PageSize}");
        // 서버에 쿼리 전송하는 로직 등
    }
}
```

### 셀 편집 활성화

```razor
<SwiftGrid TItem="Person" Data="@people" Options="@gridOptions" OnCellEdited="HandleCellEdit">
    <SwiftGridColumn TItem="Person" Field="Name" Title="이름" Editable="true" Editor="input" />
    <SwiftGridColumn TItem="Person" Field="Age" Title="나이" Editable="true" Editor="number" />
    <SwiftGridColumn TItem="Person" Field="Email" Title="이메일" Editable="true" Editor="input" />
</SwiftGrid>

@code {
    private SwiftGridOptions gridOptions = new()
    {
        History = true // Undo/Redo 활성화
    };
}
```

---

## 📚 주요 기능

- ✅ **정렬**: 컬럼 헤더 클릭으로 정렬
- ✅ **필터링**: 헤더 필터를 통한 실시간 필터링
- ✅ **페이지네이션**: 클라이언트/서버 사이드 페이지네이션 지원
- ✅ **셀 편집**: 인라인 셀 편집 및 Undo/Redo
- ✅ **행 선택**: 단일/다중 행 선택
- ✅ **데이터 내보내기**: CSV, Excel, JSON, PDF 형식 지원
- ✅ **전역 검색**: 모든 컬럼에서 검색
- ✅ **쿼리 상태 모니터링**: OnQueryChanged 이벤트로 실시간 쿼리 상태 추적

---

## 🎯 고급 사용법

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
        PaginationMode = "remote" // 서버 사이드 페이지네이션
    };

    private async Task HandleQueryChange(SwiftGridQuery query)
    {
        // 서버에 쿼리 전송
        var result = await apiService.GetPeopleAsync(query);
        filteredPeople = result.Items;
        totalCount = result.TotalCount;
    }
}
```

### 필터 연산자 사용 (Enum)

```csharp
// 권장
var filter = new SwiftGridFilter
{
    Field = "Age",
    Operator = FilterOperator.GreaterThanOrEqual,
    Value = 25
};

// 레거시
var legacyFilter = new SwiftGridFilter
{
    Field = "Age",
    Op = "gte", // 자동으로 Operator enum으로 변환됨
    Value = 25
};
```

### 정렬 방향 사용 (Enum)

```csharp
// 권장
var sort = new SwiftGridSort
{
    Field = "Name",
    Direction = SortDirection.Ascending
};

// 레거시
var legacySort = new SwiftGridSort
{
    Field = "Name",
    Dir = "asc" // 자동으로 Direction enum으로 변환됨
};
```

---

## 📖 API 문서

- `SwiftGrid<TItem>`: 메인 그리드 컴포넌트
- `SwiftGridColumn<TItem>`: 컬럼 정의 컴포넌트
- `SwiftGridOptions`: 그리드 옵션 설정
- `SwiftGridQuery`: 쿼리 상태 정보
- `SwiftGridFilter`: 필터 정보
- `SwiftGridSort`: 정렬 정보
- `CellEditedEventArgs<TItem>`: 셀 편집 이벤트 파라미터

---

## 🚀 데모

레포지토리에 포함된 `SwiftGrid.Demo` 프로젝트를 실행

```bash
cd SwiftGrid.Demo
dotnet run
```

---

SwiftGrid는 아직 작은 컴포넌트지만,  
조금씩 기능을 더해가며 오래 사용할 수 있는 탄탄한 그리드로 만들어 가고 싶어요.  
레포지토리에 데모도 함께 들어 있으니, 직접 실행해보면서 가볍게 사용해보시면 좋을 것 같아요.
