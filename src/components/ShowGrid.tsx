import { FlatList, useWindowDimensions, View, type ListRenderItem, type FlatListProps } from 'react-native';
import type { ReactElement } from 'react';
import type { Show } from '../types/models';
import { ItemCard } from './ItemCard';

interface Props {
  data: Show[]; onSelect: (id: number) => void; header?: ReactElement; footer?: ReactElement;
  empty?: ReactElement; refreshing?: boolean; onRefresh?: () => void; onEndReached?: () => void;
}
export function ShowGrid({ data, onSelect, header, footer, empty, refreshing = false, onRefresh, onEndReached }: Props) {
  const { width, fontScale } = useWindowDimensions();
  const columns = fontScale >= 1.7 || width < 340 ? 1 : width >= 800 ? 4 : width >= 600 ? 3 : 2;
  const renderItem: ListRenderItem<Show> = ({ item }) => <View style={{ width: `${100 / columns}%`, padding: 6 }}><ItemCard item={item} onPress={() => onSelect(item.id)} /></View>;
  const refreshProps: Partial<FlatListProps<Show>> = onRefresh ? { refreshing, onRefresh } : {};
  return <FlatList key={`grid-${columns}`} data={data} numColumns={columns} renderItem={renderItem}
    keyExtractor={(item) => String(item.id)} ListHeaderComponent={header} ListFooterComponent={footer}
    ListEmptyComponent={empty} onEndReached={onEndReached} onEndReachedThreshold={0.4}
    keyboardShouldPersistTaps="handled" initialNumToRender={10} windowSize={7}
    contentContainerStyle={{ padding: 14, paddingBottom: 32, maxWidth: 1040, width: '100%', alignSelf: 'center', flexGrow: 1 }}
    {...refreshProps} />;
}
