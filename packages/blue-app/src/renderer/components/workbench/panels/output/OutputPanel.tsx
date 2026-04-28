import { useRef, useCallback, useEffect, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useOutputStore } from '../../../../stores/output-store';

export default function OutputPanel() {
  const tabs = useOutputStore((s) => s.tabs);
  const tabOrder = useOutputStore((s) => s.tabOrder);
  const activeTabId = useOutputStore((s) => s.activeTabId);
  const selectTab = useOutputStore((s) => s.selectTab);
  const resetTab = useOutputStore((s) => s.resetTab);

  const activeTab = activeTabId ? tabs[activeTabId] : null;
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);

  const rowVirtualizer = useVirtualizer({
    count: activeTab?.lines.length ?? 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 20,
    overscan: 200,
  });

  useEffect(() => {
    if (autoScrollRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeTab?.lines.length]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    autoScrollRef.current = scrollHeight - scrollTop - clientHeight < 40;
  }, []);

  const errorColor = activeTab?.colorOverrides.error ?? '#ff6b6b';
  const outputColor = activeTab?.colorOverrides.output ?? '#d4d4d4';

  const lines = activeTab?.lines ?? [];

  const tabEntries = useMemo(
    () => tabOrder.map((id) => tabs[id]).filter((t) => t && !t.isClosed),
    [tabOrder, tabs],
  );

  return (
    <div className="flex flex-col h-full bg-[#1a1a2e] text-[13px] font-mono">
      <div className="flex items-center border-b border-[#333] bg-[#16162a] shrink-0">
        <div className="flex overflow-x-auto">
          {tabEntries.map((tab) => (
            <button
              key={tab.id}
              onClick={() => selectTab(tab.id)}
              className={`px-3 py-1.5 text-xs whitespace-nowrap border-r border-[#333] transition-colors ${
                tab.id === activeTabId
                  ? 'bg-[#1a1a2e] text-[#e0e0e0] border-b-2 border-b-[#4a9eff]'
                  : 'bg-[#12122a] text-[#888] hover:text-[#bbb]'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
        {activeTabId && (
          <button
            onClick={() => resetTab(activeTabId)}
            className="ml-auto px-2 py-1 text-[10px] text-[#888] hover:text-[#ccc] shrink-0"
            title="Clear output"
          >
            Clear
          </button>
        )}
      </div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto"
      >
        {lines.length === 0 ? (
          <div className="p-2 text-[#555] italic">No output.</div>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const line = lines[virtualRow.index];
              return (
                <div
                  key={line.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="px-2 whitespace-pre hover:bg-[#ffffff08]"
                >
                  <span style={{ color: line.type === 'stderr' ? errorColor : outputColor }}>
                    {line.text}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
