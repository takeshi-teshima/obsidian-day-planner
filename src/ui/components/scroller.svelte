<script lang="ts">
  import type { Snippet } from "svelte";
  import { on } from "svelte/events";

  import { getObsidianContext } from "../../context/obsidian-context";
  import {
    createAutoScroll,
    getScrollZones,
    isPointerWithinRect,
  } from "../../util/dom";

  const {
    children,
    onscroll,
    ...rest
  }: {
    children: Snippet<[boolean]>;
    class?: string | string[];
    onscroll?: (event: Event) => void;
  } = $props();

  let isUnderCursor = $state(false);
  let el: HTMLElement | undefined = $state();

  const { startScroll, stopScroll } = createAutoScroll();

  const {
    editContext: { editOperation },
  } = getObsidianContext();

  function blockPanOnEdit(el: HTMLElement) {
    const off = on(el, "touchmove", (event) => {
      if ($editOperation) {
        event.preventDefault();
      }
    });

    return {
      destroy() {
        off();
      },
    };
  }

  /**
   * Controls like the drag/resize handles are rendered via a portal, so
   * they aren't descendants of this element and native mouseenter/mouseleave
   * treat hovering them as leaving the scroller. Tracking the pointer's
   * screen position instead of DOM ancestry keeps "now" from auto-scrolling
   * away while the cursor is still visually over the timeline.
   */
  function trackCursorOverArea(node: HTMLElement) {
    const off = on(window, "pointermove", (event: PointerEvent) => {
      isUnderCursor = isPointerWithinRect(event, node);
    });

    return {
      destroy() {
        off();
      },
    };
  }
</script>

<div
  bind:this={el}
  class={["scroller", rest.class]}
  onpointerleave={stopScroll}
  onpointermove={(event) => {
    if (!$editOperation || !el) {
      return;
    }

    const scrollZones = getScrollZones(event, el);

    if (scrollZones.isInTopScrollZone) {
      startScroll({ el, direction: "up" });
    } else if (scrollZones.isInBottomScrollZone) {
      startScroll({ el, direction: "down" });
    } else {
      stopScroll();
    }
  }}
  {onscroll}
  use:blockPanOnEdit
  use:trackCursorOverArea
>
  {@render children(isUnderCursor)}
</div>

<style>
  .scroller {
    display: flex;
    background-color: var(--background-primary);
  }
</style>
