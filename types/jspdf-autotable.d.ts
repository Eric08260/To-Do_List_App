declare module "jspdf-autotable" {
  interface AutoTableOptions {
    head: any[][];
    body: any[][];
    startY?: number;
    styles?: {
      fontSize?: number;
    };
  }

  function autoTable(doc: any, options: AutoTableOptions): void;

  export default autoTable;
}
