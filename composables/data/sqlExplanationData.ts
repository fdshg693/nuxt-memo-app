export interface ExplanationLink {
  keyword: string;
  title: string;
  url: string;
}

export const explanationLinks: ExplanationLink[] = [
  { keyword: 'select', title: 'SELECT文の解説', url: '/sql/explanation/select' },
  { keyword: 'insert', title: 'INSERT文の解説', url: '/sql/explanation/insert' },
  { keyword: 'update', title: 'UPDATE文の解説', url: '/sql/explanation/update' },
  { keyword: 'delete', title: 'DELETE文の解説', url: '/sql/explanation/delete' },
  { keyword: 'join', title: 'JOIN句の解説', url: '/sql/explanation/join' },
  { keyword: 'where', title: 'WHERE句の解説', url: '/sql/explanation/where' },
  { keyword: 'groupby', title: 'GROUP BY句の解説', url: '/sql/explanation/groupby' },
  { keyword: 'orderby', title: 'ORDER BY句の解説', url: '/sql/explanation/orderby' },
  { keyword: 'count', title: 'COUNT関数の解説', url: '/sql/explanation/count' },
  { keyword: 'sum', title: 'SUM関数の解説', url: '/sql/explanation/sum' }
];

export const getAvailableExplanations = (): ExplanationLink[] => {
  return explanationLinks;
};

