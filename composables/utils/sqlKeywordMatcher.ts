export const matchSqlKeyword = (text: string, keyword: string): boolean => {
  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();

  if (new RegExp(`\\b${lowerKeyword}\\b`, 'i').test(text)) {
    return true;
  }

  switch (lowerKeyword) {
    case 'select':
      return lowerText.includes('抽出') || lowerText.includes('取得');
    case 'insert':
      return lowerText.includes('追加') || lowerText.includes('挿入');
    case 'update':
      return lowerText.includes('更新') || lowerText.includes('変更');
    case 'delete':
      return lowerText.includes('削除');
    case 'join':
      return (
        lowerText.includes('結合') ||
        lowerText.includes('inner join') ||
        lowerText.includes('left join')
      );
    case 'where':
      return lowerText.includes('条件') || lowerText.includes('絞り込み');
    case 'groupby':
      return (
        lowerText.includes('group by') ||
        lowerText.includes('group') ||
        lowerText.includes('グループ') ||
        lowerText.includes('集計')
      );
    case 'orderby':
      return (
        lowerText.includes('order by') ||
        lowerText.includes('order') ||
        lowerText.includes('並び替え') ||
        lowerText.includes('ソート')
      );
    case 'count':
      return lowerText.includes('件数') || lowerText.includes('数える');
    case 'sum':
      return lowerText.includes('合計') || lowerText.includes('総計');
    default:
      return false;
  }
};

