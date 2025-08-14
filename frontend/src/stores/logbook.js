import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useLogbookStore = defineStore('logbook', () => {
  // State
  const entries = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedEntry = ref(null)

  // Sample client data for development
  const sampleEntries = [
    {
      id: '1',
      title: 'ABC Manufacturing Corp. - Initial Consultation',
      description:
        'Met with ABC Manufacturing Corp. executives to discuss their need for automated quality control systems. They are interested in implementing IoT sensors for real-time monitoring of their production line. The company has 500+ employees and produces automotive parts. They require a solution that can integrate with their existing ERP system and provide predictive maintenance capabilities.',
      date: new Date('2024-01-15'),
      category: 'Technology Transfer',
      location: 'ABC Manufacturing Corp., Laguna',
      contactPerson: 'Maria Santos - Chief Technology Officer',
      tags: ['manufacturing', 'iot', 'automation', 'quality-control'],
      status: 'Active',
      priority: 'High',
      agency: 'DOST-CALABARZON',
      createdAt: new Date('2024-01-15T08:30:00'),
      updatedAt: new Date('2024-01-15T08:30:00'),
    },
    {
      id: '2',
      title: 'XYZ Agritech Solutions - Research Collaboration',
      description:
        'Established partnership with XYZ Agritech Solutions for developing smart farming technologies. They specialize in precision agriculture and want to collaborate on developing AI-powered crop monitoring systems. The project involves creating machine learning models for disease detection and yield prediction using drone imagery and satellite data.',
      date: new Date('2024-01-14'),
      category: 'Research Partnership',
      location: 'DOST-PCAARRD, Los Baños',
      contactPerson: 'Dr. Juan Cruz - Research Director',
      tags: ['agriculture', 'ai', 'machine-learning', 'precision-farming'],
      status: 'Active',
      priority: 'Medium',
      agency: 'DOST-PCAARRD',
      createdAt: new Date('2024-01-14T20:15:00'),
      updatedAt: new Date('2024-01-14T20:15:00'),
    },
    {
      id: '3',
      title: 'GreenTech Innovations - Startup Incubation',
      description:
        'Onboarded GreenTech Innovations into the DOST startup incubation program. They are developing sustainable packaging solutions using agricultural waste. The startup was founded by young entrepreneurs from UP Diliman and shows great potential for environmental impact. Provided initial funding of PHP 2M and assigned mentorship team.',
      date: new Date('2024-01-12'),
      category: 'Startup Incubation',
      location: 'DOST Technology Business Incubator, QC',
      contactPerson: 'Sarah Lopez - CEO & Founder',
      tags: ['startup', 'sustainability', 'packaging', 'environment'],
      status: 'Active',
      priority: 'Medium',
      agency: 'DOST-TBI',
      createdAt: new Date('2024-01-12T19:45:00'),
      updatedAt: new Date('2024-01-12T19:45:00'),
    },
  ]

  // Getters
  const sortedEntries = computed(() => {
    return [...entries.value].sort((a, b) => new Date(b.date) - new Date(a.date))
  })

  const entriesByCategory = computed(() => {
    const grouped = {}
    entries.value.forEach((entry) => {
      const category = entry.category || 'Uncategorized'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(entry)
    })
    return grouped
  })

  const entriesByStatus = computed(() => {
    const grouped = {}
    entries.value.forEach((entry) => {
      const status = entry.status || 'Unknown'
      if (!grouped[status]) {
        grouped[status] = []
      }
      grouped[status].push(entry)
    })
    return grouped
  })

  const entriesByAgency = computed(() => {
    const grouped = {}
    entries.value.forEach((entry) => {
      const agency = entry.agency || 'Unknown'
      if (!grouped[agency]) {
        grouped[agency] = []
      }
      grouped[agency].push(entry)
    })
    return grouped
  })

  const categories = computed(() => {
    const categorySet = new Set()
    entries.value.forEach((entry) => {
      if (entry.category) {
        categorySet.add(entry.category)
      }
    })
    return Array.from(categorySet).sort()
  })

  const allTags = computed(() => {
    const tagSet = new Set()
    entries.value.forEach((entry) => {
      if (entry.tags) {
        entry.tags.forEach((tag) => tagSet.add(tag))
      }
    })
    return Array.from(tagSet).sort()
  })

  const allStatuses = computed(() => {
    const statusSet = new Set()
    entries.value.forEach((entry) => {
      if (entry.status) {
        statusSet.add(entry.status)
      }
    })
    return Array.from(statusSet).sort()
  })

  const allAgencies = computed(() => {
    const agencySet = new Set()
    entries.value.forEach((entry) => {
      if (entry.agency) {
        agencySet.add(entry.agency)
      }
    })
    return Array.from(agencySet).sort()
  })

  const recentEntries = computed(() => {
    return sortedEntries.value.slice(0, 5)
  })

  const entriesThisMonth = computed(() => {
    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()

    return entries.value.filter((entry) => {
      const entryDate = new Date(entry.date)
      return entryDate.getMonth() === thisMonth && entryDate.getFullYear() === thisYear
    })
  })

  const activeClients = computed(() => {
    return entries.value.filter((entry) => entry.status === 'Active')
  })

  const highPriorityClients = computed(() => {
    return entries.value.filter((entry) => entry.priority === 'High')
  })

  // Actions
  const initializeStore = () => {
    // Load sample data if no entries exist
    if (entries.value.length === 0) {
      entries.value = [...sampleEntries]
    }
  }

  const createEntry = async (entryData) => {
    loading.value = true
    error.value = null

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const newEntry = {
        ...entryData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      entries.value.push(newEntry)
      return newEntry
    } catch (err) {
      error.value = 'Failed to create entry'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateEntry = async (id, entryData) => {
    loading.value = true
    error.value = null

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const index = entries.value.findIndex((entry) => entry.id === id)
      if (index === -1) {
        throw new Error('Entry not found')
      }

      const updatedEntry = {
        ...entries.value[index],
        ...entryData,
        updatedAt: new Date(),
      }

      entries.value[index] = updatedEntry
      return updatedEntry
    } catch (err) {
      error.value = 'Failed to update entry'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteEntry = async (id) => {
    loading.value = true
    error.value = null

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300))

      const index = entries.value.findIndex((entry) => entry.id === id)
      if (index === -1) {
        throw new Error('Entry not found')
      }

      entries.value.splice(index, 1)

      // Clear selected entry if it was deleted
      if (selectedEntry.value && selectedEntry.value.id === id) {
        selectedEntry.value = null
      }
    } catch (err) {
      error.value = 'Failed to delete entry'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getEntryById = (id) => {
    return entries.value.find((entry) => entry.id === id)
  }

  const setSelectedEntry = (entry) => {
    selectedEntry.value = entry
  }

  const searchEntries = (searchTerm) => {
    const term = searchTerm.toLowerCase()
    return entries.value.filter(
      (entry) =>
        entry.title.toLowerCase().includes(term) ||
        entry.description.toLowerCase().includes(term) ||
        (entry.tags && entry.tags.some((tag) => tag.toLowerCase().includes(term))) ||
        (entry.category && entry.category.toLowerCase().includes(term)) ||
        (entry.location && entry.location.toLowerCase().includes(term)),
    )
  }

  const getEntriesByCategory = (category) => {
    return entries.value.filter((entry) => entry.category === category)
  }

  const getEntriesByTag = (tag) => {
    return entries.value.filter((entry) => entry.tags && entry.tags.includes(tag))
  }

  const getEntriesInDateRange = (startDate, endDate) => {
    return entries.value.filter((entry) => {
      const entryDate = new Date(entry.date)
      return entryDate >= startDate && entryDate <= endDate
    })
  }

  const clearError = () => {
    error.value = null
  }

  // Statistics
  const getStats = computed(() => {
    const totalEntries = entries.value.length
    const categoriesCount = categories.value.length
    const tagsCount = allTags.value.length
    const thisMonthCount = entriesThisMonth.value.length

    // Calculate streak (consecutive days with entries)
    let streak = 0
    const today = new Date()
    let currentDate = new Date(today)
    currentDate.setHours(0, 0, 0, 0)

    while (true) {
      const hasEntry = entries.value.some((entry) => {
        const entryDate = new Date(entry.date)
        entryDate.setHours(0, 0, 0, 0)
        return entryDate.getTime() === currentDate.getTime()
      })

      if (hasEntry) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return {
      totalEntries,
      totalClients: totalEntries,
      activeClients: activeClients.value.length,
      categoriesCount,
      tagsCount,
      thisMonthCount,
      currentStreak: streak,
      agenciesCount: allAgencies.value.length,
      highPriorityCount: highPriorityClients.value.length,
    }
  })

  return {
    // State
    entries,
    loading,
    error,
    selectedEntry,

    // Getters
    sortedEntries,
    entriesByCategory,
    entriesByStatus,
    entriesByAgency,
    categories,
    allTags,
    allStatuses,
    allAgencies,
    recentEntries,
    entriesThisMonth,
    activeClients,
    highPriorityClients,
    getStats,

    // Actions
    initializeStore,
    createEntry,
    updateEntry,
    deleteEntry,
    getEntryById,
    setSelectedEntry,
    searchEntries,
    getEntriesByCategory,
    getEntriesByTag,
    getEntriesInDateRange,
    clearError,
  }
})
