// 组件相关工具

// 拼接类名：originClass：原始类名； propsClass：传进来的类名； 为空返回 undefined
export function getClassName(originClass, propsClass): string | undefined {
  let className = '';
  if (originClass) className += originClass;
  if (propsClass) className += className ? ` ${propsClass}` : propsClass;
  return className || undefined;
}
