import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { FixedSizeList as List } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import AutoSizer from 'react-virtualized-auto-sizer'
import { useInView } from 'react-intersection-observer'
import {
  Box,
  CircularProgress,
  Typography,
  Skeleton,
  Alert
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'

const InfiniteScrollList = ({
  items = [],
  hasNextPage = false,
  isNextPageLoading = false,
  loadNextPage,
  renderItem,
  itemHeight = 200,
  threshold = 5,
  error = null,
  emptyMessage = "No items found",
  loadingMessage = "Loading more items..."
}) => {
  const [ref, inView] = useInView({
    threshold: 0,
    rootMargin: '100px'
  })

  // Load more items when scrolling near the bottom
  useEffect(() => {
    if (inView && hasNextPage && !isNextPageLoading) {
      loadNextPage()
    }
  }, [inView, hasNextPage, isNextPageLoading, loadNextPage])

  // Memoized item count for performance
  const itemCount = useMemo(() => {
    return hasNextPage ? items.length + 1 : items.length
  }, [items.length, hasNextPage])

  // Check if item is loaded
  const isItemLoaded = useCallback((index) => {
    return !!items[index]
  }, [items])

  // Render individual list item
  const Item = useCallback(({ index, style }) => {
    const isLoading = index >= items.length
    
    if (isLoading) {
      return (
        <div style={style}>
          <Box sx={{ p: 2 }}>
            <Skeleton variant="rectangular" height={itemHeight - 32} />
          </Box>
        </div>
      )
    }

    const item = items[index]
    
    return (
      <motion.div
        style={style}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        {renderItem(item, index)}
      </motion.div>
    )
  }, [items, itemHeight, renderItem])

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    )
  }

  // Empty state
  if (items.length === 0 && !isNextPageLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: 300,
        p: 3 
      }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {emptyMessage}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <AutoSizer>
        {({ height, width }) => (
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={itemCount}
            loadMoreItems={loadNextPage}
            threshold={threshold}
          >
            {({ onItemsRendered, ref: infiniteRef }) => (
              <List
                ref={infiniteRef}
                height={height}
                width={width}
                itemCount={itemCount}
                itemSize={itemHeight}
                onItemsRendered={onItemsRendered}
                overscanCount={5}
              >
                {Item}
              </List>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
      
      {/* Loading indicator at bottom */}
      <div ref={ref} style={{ height: 1 }} />
      
      <AnimatePresence>
        {isNextPageLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              p: 3,
              gap: 2
            }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary">
                {loadingMessage}
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )
}

export default InfiniteScrollList
