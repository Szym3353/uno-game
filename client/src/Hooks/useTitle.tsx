import { useEffect } from "react";

export default function useTitle(value: string) {
  useEffect(() => {
    const prevTitle = document.title;
    const subTitle = "| Uno";
    document.title = `${value} ${subTitle}`;
    return () => {
      document.title = `${prevTitle} ${subTitle}`;
    };
  });
}
