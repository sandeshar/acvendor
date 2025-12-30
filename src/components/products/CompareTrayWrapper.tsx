"use client";

import CompareTray from './CompareTray';
import useCompare from './useCompare';

export default function CompareTrayWrapper() {
    const { items, removeItem, clear } = useCompare();
    return (
        <CompareTray items={items} removeItem={removeItem} clear={clear} />
    );
}
