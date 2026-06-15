export const classnames: ClassNames = (obj, array) => {
  const result = Object.entries(obj).reduce<string[]>((acc, [key, value]) => {
    value && acc.push(key);

    return acc;
  }, []);

  return `${result.join(" ")} ${(array || []).join(" ")}`.trim();
};

export type ClassNames = (
  obj: Record<string, boolean>,
  array?: string[],
) => string;
