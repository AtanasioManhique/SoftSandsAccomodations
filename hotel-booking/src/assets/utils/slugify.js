
export const slugify = (text) =>
  text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/\s+/g, "-"); // troca espaços por "-"