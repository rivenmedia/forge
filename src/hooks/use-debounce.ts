import React from "react"

export function useDebounce<T>(value: T, delay?: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

    React.useEffect(() => {
      const timer = setTimeout(() => setDebouncedValue(value), delay || 500)

      return () => clearTimeout(timer)
    }, [value, delay])

    return debouncedValue
  }


//   export function useDebounce<T>(value: T, delay: number): T {
//     const [debouncedValue, setDebouncedValue] = React.useState<T>(value)
//     const timeoutRef = React.useRef<NodeJS.Timeout>(undefined)
//     const previousValue = React.useRef<T>(value)

//     React.useEffect(() => {
//       // Only update if the value has changed
//       if (value !== previousValue.current) {
//         console.log('Value changed:', { previous: previousValue.current, current: value })

//         // Clear any existing timeout
//         if (timeoutRef.current) {
//           console.log('Clearing previous timeout')
//           clearTimeout(timeoutRef.current)
//         }

//         console.log(`Setting new timeout for ${delay}ms`)
//         timeoutRef.current = setTimeout(() => {
//           console.log('Timeout executed, updating debounced value:', value)
//           setDebouncedValue(value)
//         }, delay)

//         previousValue.current = value
//       }

//       // Cleanup on unmount or delay change
//       return () => {
//         if (timeoutRef.current) {
//           console.log('Cleaning up timeout on unmount/update')
//           clearTimeout(timeoutRef.current)
//         }
//       }
//     }, [value, delay])

//     return debouncedValue
//   }
