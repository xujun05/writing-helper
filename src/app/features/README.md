# 功能页面目录

此目录用于存放应用程序的各种功能页面。每个功能应该在此目录下创建一个子目录。

## 目录结构

```
features/
  ├── template/            # 功能页面模板
  │   └── page.tsx         # 页面组件
  ├── [feature-name]/      # 具体功能目录
  │   └── page.tsx         # 页面组件
  └── README.md            # 本文档
```

## 如何添加新功能页面

1. 复制 `template` 目录，重命名为你的功能名称（使用小写和连字符，例如 `my-feature`）
2. 修改 `page.tsx` 中的标题、描述和组件
3. 在 `src/app/components/Navigation.tsx` 文件中的 `featureLinks` 数组中添加新的导航项：

```tsx
export const featureLinks: NavLink[] = [
  // 现有链接
  { href: '/features/my-feature', label: '我的新功能' },
];
```

4. 开发你的功能组件，可以放在 `src/app/components` 目录下或创建一个专用的组件目录

## 最佳实践

- 使用 `FeatureLayout` 组件包装你的功能内容以保持一致的UI
- 保持每个功能的代码组织在各自的目录中
- 功能组件应该考虑重用现有的UI组件
- 为复杂的功能创建专用的API端点（放在 `app/api` 目录）

## 示例

查看模板目录 (`template/`) 以了解基本结构。 