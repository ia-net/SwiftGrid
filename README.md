<p align="center">
  <img src="https://raw.githubusercontent.com/ia-net/SwiftGrid/main/assets/logo.png" alt="SwiftGrid logo" width="120" />
</p>

<h1 align="center">SwiftGrid</h1>

<p align="center">
  <strong>Blazor에서 가볍게 가져다 쓰는 데이터 그리드 컴포넌트</strong><br/>
  Tabulator 기반 · C# & Razor 친화적
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Framework-Blazor-5C2D91?logo=blazor&logoColor=white" />
  <img src="https://img.shields.io/badge/Tabulator-6.x-blue" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" />
  <img src="https://img.shields.io/badge/Status-Early%20Stage-orange" />
</p>


SwiftGrid는 Blazor에서 간단하게 사용할 수 있는 데이터 그리드 컴포넌트입니다.  
[Tabulator](https://tabulator.info/)를 기반으로 하여, C#과 Razor만으로 테이블 UI를 빠르게 구성할 수 있도록 만든 프로젝트입니다.

아직은 초기 단계지만, 함께 개선해 나가면 더 좋은 그리드가 될 거라 생각해요 🙂

---

### 어떻게 쓰나요?

- 이 저장소를 클론한 뒤 `SwiftGrid.sln`을 열고 `SwiftGrid.Demo` 프로젝트를 실행해 보세요.  
  기본 사용법과 동작 모습을 바로 확인할 수 있습니다.
- 실제 프로젝트에서 사용하려면 솔루션에 `SwiftGrid` 프로젝트를 추가하고,  
  사용하는 프로젝트에서 `ProjectReference`로 연결해 주면 됩니다.

아래는 가장 간단한 사용 예시입니다.

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