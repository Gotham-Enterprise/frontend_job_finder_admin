'use client'

import React, { useState, useEffect } from 'react'
import { authUtils } from '@/services/utils/authUtils'
import { getAllForumUsers, blockUser, unblockUser } from '@/services/api/forumModerationApi'
import type { BlockedUser, PaginationMeta } from '@/services/api/forumModerationApi'
import { Shield, Unlock, Search, X } from 'lucide-react'
import BlockUserModal from './BlockUserModal'

interface AllUsersTabProps {
  onStatsUpdate: () => void
}

export default function AllUsersTab({ onStatsUpdate }: AllUsersTabProps) {
  const [users, setUsers] = useState<BlockedUser[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [blockedFilter, setBlockedFilter] = useState<'all' | 'blocked' | 'active'>('all')
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
  const [selectedUserForBlock, setSelectedUserForBlock] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [currentPage, searchQuery, blockedFilter])

  const loadUsers = async () => {
    const token = authUtils.getToken()
    if (!token) return
    try {
      setIsLoading(true)
      const params: any = { 
        page: currentPage, 
        limit: 20,
        search: searchQuery.trim() || undefined
      }
      
      // Add blocked filter
      if (blockedFilter === 'blocked') {
        params.blocked = 'true'
      } else if (blockedFilter === 'active') {
        params.blocked = 'false'
      }
      // If 'all', don't add blocked parameter
      
      const data = await getAllForumUsers(token, params)
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page on new search
    setSearchQuery(searchInput)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setSearchQuery('')
    setCurrentPage(1)
  }

  const handleBlock = async (userId: string, reason: string) => {
    const token = authUtils.getToken()
    if (!token) {
      alert('Authentication required')
      return
    }
    try {
      await blockUser(token, userId, { reason })
      await loadUsers()
      onStatsUpdate()
    } catch (error) {
      console.error('Failed to block user:', error)
      alert('Failed to block user')
    }
  }

  const handleUnblock = async (user: BlockedUser) => {
    const token = authUtils.getToken()
    if (!token) return
    if (!confirm(`Unblock ${user.displayName}?`)) return
    try {
      await unblockUser(token, user.id)
      loadUsers()
      onStatsUpdate()
    } catch (error) {
      console.error('Failed to unblock user:', error)
      alert('Failed to unblock user')
    }
  }

  const openBlockModal = (userId: string) => {
    setSelectedUserForBlock(userId)
    setIsBlockModalOpen(true)
  }

  const handleBlockSubmit = async (userId: string, reason: string) => {
    await handleBlock(userId, reason)
  }

  if (isLoading) return <div className="text-center py-8">Loading...</div>

  return (
    <>
      {/* Header with Search */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              All Forum Users
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Search and manage forum users
            </p>
          </div>
        </div>

        {/* Search Bar and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by username or display name..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            Search
          </button>
        </form>

        {/* Status Filter */}
        <select
          value={blockedFilter}
          onChange={(e) => {
            setBlockedFilter(e.target.value as 'all' | 'blocked' | 'active')
            setCurrentPage(1)
          }}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">All Users</option>
          <option value="active">Active Users</option>
          <option value="blocked">Blocked Users</option>
        </select>
      </div>

      {searchQuery && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Searching for: <span className="font-semibold">{searchQuery}</span>
          {' '}({pagination?.totalCount || 0} results)
        </div>
      )}
    </div>

      {users.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchQuery ? 'No users found matching your search.' : 'No forum users found.'}
        </div>
      ) : (
        <>
          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Reputation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.displayName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        @{user.user.username}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {user.reputation}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isBlocked ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Blocked
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.isBlocked ? (
                        <button
                          onClick={() => handleUnblock(user)}
                          className="inline-flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors duration-200"
                        >
                          <Unlock className="w-4 h-4 mr-1" />
                          Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() => openBlockModal(user.id)}
                          className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-200"
                        >
                          <Shield className="w-4 h-4 mr-1" />
                          Block
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total users)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-600"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-600"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Block User Modal */}
      <BlockUserModal
        isOpen={isBlockModalOpen}
        userId={selectedUserForBlock || undefined}
        onClose={() => {
          setIsBlockModalOpen(false)
          setSelectedUserForBlock(null)
        }}
        onSubmit={(userId, reason) => handleBlockSubmit(userId, reason)}
      />
    </>
  )
}
