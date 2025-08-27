# 🚀 Система ленивой загрузки (Lazy Loading)

Система ленивой загрузки позволяет оптимизировать производительность приложения, загружая компоненты только когда они действительно нужны.

## 📁 Структура файлов

```
src/routes/
├── index.js              # Экспорт всех компонентов
├── lazyRoutes.js         # Ленивые компоненты
├── routeConfig.js        # Конфигурация роутов
└── README.md            # Документация

src/components/ui/general/
├── LazyLoader/           # Компоненты для ленивой загрузки
│   └── index.jsx        # LazyLoader, LazyPage, withLazyLoading
└── RouteRenderer/        # Рендерер роутов
    └── index.jsx        # RouteRenderer компонент

src/hooks/
└── useLazyComponent/     # Хуки для ленивой загрузки
    └── index.jsx        # useLazyComponent, usePreloadComponent
```

## 🎯 Что дает ленивая загрузка

### **⚡ Производительность:**

- **Уменьшение начального размера бандла** - компоненты загружаются по требованию
- **Быстрая загрузка приложения** - только критически важные компоненты загружаются сразу
- **Оптимизация памяти** - неиспользуемые компоненты не занимают место в памяти

### **🔄 Пользовательский опыт:**

- **Быстрый старт** - приложение запускается мгновенно
- **Плавная навигация** - компоненты загружаются в фоне
- **Индикаторы загрузки** - пользователь видит прогресс загрузки

### **📱 Мобильная оптимизация:**

- **Экономия трафика** - загружаются только нужные компоненты
- **Лучшая производительность** - меньше нагрузки на устройство

## 🛠️ Компоненты системы

### **1. LazyLoader**

Простой компонент-обертка для Suspense с предустановленным Loader.

```jsx
import { LazyLoader } from '@/components/ui/general/LazyLoader'

const App = () => {
	return (
		<LazyLoader>
			<MyComponent />
		</LazyLoader>
	)
}
```

### **2. LazyPage**

Компонент для ленивой загрузки страниц с автоматическим Suspense.

```jsx
import { LazyPage } from '@/components/ui/general/LazyLoader'
import { LazyWalletPage } from '@/routes/lazyRoutes'

const MyComponent = () => {
	return <LazyPage component={LazyWalletPage} />
}
```

### **3. withLazyLoading**

HOC для оборачивания компонентов в ленивую загрузку.

```jsx
import { withLazyLoading } from '@/components/ui/general/LazyLoader'

const LazyComponent = withLazyLoading(MyComponent)
```

### **4. RouteRenderer**

Автоматический рендерер роутов с ленивой загрузкой.

```jsx
import { RouteRenderer } from '@/components/ui/general/RouteRenderer'

const App = () => {
	const routes = useMemo(() => createRoutes(isAuth, user), [isAuth, user])

	return <RouteRenderer routes={routes} />
}
```

## 🎣 Хуки для ленивой загрузки

### **useLazyComponent**

Хук для программной загрузки компонентов.

```jsx
import { useLazyComponent } from '@/hooks/useLazyComponent'

const MyComponent = () => {
	const { Component, isLoading, error } = useLazyComponent('WalletPage')

	if (isLoading) return <Loader />
	if (error) return <ErrorComponent />

	return <Component />
}
```

### **usePreloadComponent**

Хук для предварительной загрузки компонентов (например, при наведении).

```jsx
import { usePreloadComponent } from '@/hooks/useLazyComponent'

const SideBarItem = ({ route }) => {
	const { preload } = usePreloadComponent('WalletPage')

	return <div onMouseEnter={preload}>Wallet</div>
}
```

## 🚀 Использование в приложении

### **1. Основное приложение**

```jsx
import { LazyLoader } from '@/components/ui/general/LazyLoader'
import { RouteRenderer } from '@/components/ui/general/RouteRenderer'
import { createRoutes } from '@/routes/routeConfig.js'

const App = () => {
	const routes = useMemo(() => createRoutes(isAuth, user), [isAuth, user])

	return (
		<LazyLoader>
			<RouteRenderer routes={routes} />
		</LazyLoader>
	)
}
```

### **2. Конфигурация роутов**

```jsx
// routeConfig.js
import { LazyWalletPage, LazyTablePage } from '@/routes/lazyRoutes'

export const protectedRoutes = [
	{
		path: '/wallet',
		component: LazyWalletPage,
	},
	{
		path: '/table',
		component: LazyTablePage,
	},
]
```

### **3. Ленивые компоненты**

```jsx
// lazyRoutes.js
export const LazyWalletPage = React.lazy(() => import('@/pages/WalletPage'))
export const LazyTablePage = React.lazy(() => import('@/pages/TablePage'))
```

## 📊 Преимущества для разработки

### **🔧 Разработка:**

- **Модульность** - каждый компонент загружается отдельно
- **Отладка** - легче найти проблемы в конкретных компонентах
- **Тестирование** - можно тестировать компоненты изолированно

### **🚀 Продакшн:**

- **Кэширование** - браузер может кэшировать отдельные чанки
- **CDN оптимизация** - разные компоненты могут быть на разных серверах
- **Аналитика** - можно отслеживать загрузку конкретных компонентов

## 🎨 Кастомизация

### **Кастомный Loader**

```jsx
import { LazyLoader } from '@/components/ui/general/LazyLoader'

const CustomLoader = () => <div>Загрузка...</div>

const App = () => {
	return (
		<LazyLoader fallback={<CustomLoader />}>
			<MyComponent />
		</LazyLoader>
	)
}
```

### **Обработка ошибок**

```jsx
import { useLazyComponent } from '@/hooks/useLazyComponent'

const MyComponent = () => {
	const { Component, isLoading, error } = useLazyComponent('WalletPage')

	if (error) {
		return (
			<div>
				<h3>Ошибка загрузки</h3>
				<button onClick={() => window.location.reload()}>Перезагрузить</button>
			</div>
		)
	}

	return <Component />
}
```

## 📈 Мониторинг производительности

### **Время загрузки компонентов**

```jsx
const { Component, isLoading } = useLazyComponent('WalletPage')

useEffect(() => {
	if (!isLoading && Component) {
		console.log('WalletPage загружен за:', performance.now())
	}
}, [isLoading, Component])
```

### **Размер чанков**

Используйте инструменты разработчика браузера для анализа размера загружаемых чанков.

## 🎯 Лучшие практики

1. **Группируйте связанные компоненты** в один чанк
2. **Используйте предзагрузку** для часто посещаемых страниц
3. **Обрабатывайте ошибки загрузки** gracefully
4. **Мониторьте производительность** в продакшне
5. **Тестируйте на медленных соединениях**

## 🔧 Отладка

### **Проверка загрузки компонентов**

```jsx
// В консоли браузера
console.log('Загруженные компоненты:', window.__REACT_DEVTOOLS_GLOBAL_HOOK__)
```

### **Анализ чанков**

Используйте Network tab в DevTools для анализа загружаемых файлов.

---

**Система ленивой загрузки обеспечивает оптимальную производительность и отличный пользовательский опыт! 🚀**
