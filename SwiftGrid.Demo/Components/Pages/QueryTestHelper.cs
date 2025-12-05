using System.Linq;
using System.Linq.Expressions;
using SwiftGrid.Entities;

namespace SwiftGrid.Demo.Components.Pages
{
    /// <summary>
    /// QueryTest 페이지의 쿼리 처리 헬퍼 클래스
    /// </summary>
    public static class QueryTestHelper
    {
        /// <summary>
        /// 필터 연산자 상수
        /// </summary>
        public static class FilterOperators
        {
            public const string Equal = "eq";
            public const string NotEqual = "neq";
            public const string Like = "like";
            public const string GreaterThan = "gt";
            public const string GreaterThanOrEqual = "gte";
            public const string LessThan = "lt";
            public const string LessThanOrEqual = "lte";
        }

        /// <summary>
        /// 필터를 쿼리에 적용합니다.
        /// </summary>
        public static IQueryable<T> ApplyFilter<T>(
            IQueryable<T> query,
            string field,
            string op,
            object? value)
        {
            if (value == null || string.IsNullOrWhiteSpace(field))
            {
                return query;
            }

            var fieldLower = field.ToLower();
            var opLower = op.ToLower();

            return fieldLower switch
            {
                "id" when TryParseInt(value, out int idValue) =>
                    ApplyNumericFilter(query, p => p != null ? GetPropertyValue<int>(p, "Id") : 0, opLower, idValue),
                "age" when TryParseInt(value, out int ageValue) =>
                    ApplyNumericFilter(query, p => p != null ? GetPropertyValue<int>(p, "Age") : 0, opLower, ageValue),
                "name" => ApplyStringFilter(query, p => p != null ? GetPropertyValue<string>(p, "Name") : "", opLower, value),
                "email" => ApplyStringFilter(query, p => p != null ? GetPropertyValue<string>(p, "Email") : "", opLower, value),
                "department" => ApplyStringFilter(query, p => p != null ? GetPropertyValue<string>(p, "Department") : "", opLower, value),
                _ => query
            };
        }

        /// <summary>
        /// 숫자 필터를 적용합니다.
        /// </summary>
        private static IQueryable<T> ApplyNumericFilter<T, TValue>(
            IQueryable<T> query,
            Func<T, TValue> propertySelector,
            string op,
            TValue value)
            where TValue : IComparable<TValue>
        {
            return op switch
            {
                FilterOperators.Equal => query.Where(x => Comparer<TValue>.Default.Compare(propertySelector(x), value) == 0),
                FilterOperators.NotEqual => query.Where(x => Comparer<TValue>.Default.Compare(propertySelector(x), value) != 0),
                FilterOperators.GreaterThan => query.Where(x => Comparer<TValue>.Default.Compare(propertySelector(x), value) > 0),
                FilterOperators.GreaterThanOrEqual => query.Where(x => Comparer<TValue>.Default.Compare(propertySelector(x), value) >= 0),
                FilterOperators.LessThan => query.Where(x => Comparer<TValue>.Default.Compare(propertySelector(x), value) < 0),
                FilterOperators.LessThanOrEqual => query.Where(x => Comparer<TValue>.Default.Compare(propertySelector(x), value) <= 0),
                _ => query
            };
        }

        /// <summary>
        /// 문자열 필터를 적용합니다.
        /// </summary>
        private static IQueryable<T> ApplyStringFilter<T>(
            IQueryable<T> query,
            Func<T, string?> propertySelector,
            string op,
            object value)
        {
            var valueStr = value?.ToString() ?? "";

            return op switch
            {
                FilterOperators.Equal => query.Where(x => propertySelector(x) == valueStr),
                FilterOperators.NotEqual => query.Where(x => propertySelector(x) != valueStr),
                FilterOperators.Like => query.Where(x => (propertySelector(x) ?? "").Contains(valueStr)),
                _ => query
            };
        }

        /// <summary>
        /// 정렬 표현식을 가져옵니다.
        /// </summary>
        public static Expression<Func<T, object>> GetSortExpression<T>(string field)
        {
            return field.ToLower() switch
            {
                "id" => x => x != null ? (object)GetPropertyValue<int>(x, "Id") : 0,
                "name" => x => x != null ? (object)(GetPropertyValue<string>(x, "Name") ?? "") : "",
                "age" => x => x != null ? (object)GetPropertyValue<int>(x, "Age") : 0,
                "email" => x => x != null ? (object)(GetPropertyValue<string>(x, "Email") ?? "") : "",
                "department" => x => x != null ? (object)(GetPropertyValue<string>(x, "Department") ?? "") : "",
                _ => x => x != null ? (object)GetPropertyValue<int>(x, "Id") : 0
            };
        }

        /// <summary>
        /// 전역 검색을 적용합니다.
        /// </summary>
        public static IQueryable<T> ApplyGlobalSearch<T>(
            IQueryable<T> query,
            string searchTerm,
            params string[] searchableFields)
        {
            if (string.IsNullOrWhiteSpace(searchTerm) || searchableFields.Length == 0)
            {
                return query;
            }

            var searchLower = searchTerm.ToLower();
            var materialized = query.ToList(); // LINQ to Objects로 변환

            return materialized
                .Where(x =>
                {
                    if (x == null) return false;
                    return searchableFields.Any(field =>
                    {
                        var value = GetPropertyValue<object>(x, field);
                        if (value == null) return false;
                        var valueStr = value.ToString();
                        return valueStr != null && valueStr.ToLower().Contains(searchLower);
                    });
                })
                .AsQueryable();
        }

        /// <summary>
        /// 리플렉션을 사용하여 속성 값을 가져옵니다.
        /// </summary>
        private static TValue GetPropertyValue<TValue>(object obj, string propertyName)
        {
            var property = obj.GetType().GetProperty(propertyName);
            if (property == null)
            {
                return default(TValue)!;
            }

            var value = property.GetValue(obj);
            if (value is TValue typedValue)
            {
                return typedValue;
            }

            return default(TValue)!;
        }

        /// <summary>
        /// 정수를 파싱합니다.
        /// </summary>
        private static bool TryParseInt(object? value, out int result)
        {
            result = 0;
            return value != null && int.TryParse(value.ToString(), out result);
        }
    }
}

