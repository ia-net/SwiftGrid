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

### 📦 설치

SwiftGrid는 별도 NuGet 패키지 없이  
레포지토리의 `SwiftGrid` 프로젝트를 직접 ProjectReference로 연결해 사용합니다.

```xml
<ItemGroup>
    <ProjectReference Include="..\SwiftGrid\SwiftGrid.csproj" />
</ItemGroup>

```

### ✨ 기본 예시

```razor
@using SwiftGrid.Components
@using SwiftGrid.Entities

<SwiftGrid Data="@people" Options="@gridOptions">
    <SwiftGridColumn Field="Id" Title="ID" Sortable="true" />
    <SwiftGridColumn Field="Name" Title="이름" Sortable="true" />
    <SwiftGridColumn Field="Email" Title="이메일" />
    <SwiftGridColumn Field="Age" Title="나이" Sortable="true" />
</SwiftGrid>
```

---

SwiftGrid는 아직 작은 컴포넌트지만,  
조금씩 기능을 더해가며 오래 사용할 수 있는 탄탄한 그리드로 만들어 가고 싶어요.  
레포지토리에 데모도 함께 들어 있으니, 직접 실행해보면서 가볍게 사용해보시면 좋을 것 같아요 🙂
