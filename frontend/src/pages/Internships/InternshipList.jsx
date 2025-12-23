import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import {
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Filter,
  X,
  Bookmark,
  Globe,
  ExternalLink,
  Star,
  ChevronRight,
  Search,
} from "lucide-react";

import {
  getInternships,
  getInternshipsWithExternal,
  setFilters,
  setPagination,
  toggleSaveInternship,
} from "../../store/slices/internshipSlice";
import {
  ListSkeleton,
  InternshipCardSkeleton,
} from "../../components/UI/Skeleton";
import {
  EmptyInternships,
  EmptySearchResults,
} from "../../components/UI/EmptyState";
import WishlistButton from "../../components/Wishlist/WishlistButton";

const categories = [
  "Software Development",
  "Data Science",
  "Machine Learning",
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Digital Marketing",
  "Business Development",
  "Finance",
  "Human Resources",
  "Content Writing",
  "Graphic Design",
  "Sales",
  "Operations",
  "Research",
  "Other",
];

const InternshipList = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { internships, filters, pagination, isLoading } = useSelector(
    (state) => state.internships,
  );
  const { user } = useSelector((state) => state.auth);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [includeExternal, setIncludeExternal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Initialize filters from URL params
    const urlFilters = {
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
      location: searchParams.get("location") || "",
      type: searchParams.get("type") || "",
      remote: searchParams.get("remote") === "true",
      stipendMin: searchParams.get("stipendMin") || "",
      stipendMax: searchParams.get("stipendMax") || "",
    };

    dispatch(setFilters(urlFilters));
    setLocalFilters(urlFilters);
    setSearchQuery(urlFilters.search);
  }, [searchParams, dispatch]);

  useEffect(() => {
    // Fetch internships when filters change
    const params = {
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
    };

    if (includeExternal) {
      dispatch(getInternshipsWithExternal(params));
    } else {
      dispatch(getInternships(params));
    }
  }, [dispatch, filters, pagination.page, pagination.limit, includeExternal]);

  const handleFilterChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleFilterChange("search", searchQuery);
    applyFilters();
  };

  const applyFilters = () => {
    dispatch(setFilters(localFilters));

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value.toString());
      }
    });
    setSearchParams(params);

    setFiltersOpen(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      category: "",
      location: "",
      type: "",
      remote: false,
      stipendMin: "",
      stipendMax: "",
    };
    setLocalFilters(clearedFilters);
    setSearchQuery("");
    dispatch(setFilters(clearedFilters));
    setSearchParams({});
  };

  const handlePageChange = (page) => {
    dispatch(setPagination({ page }));
  };

  const handleSaveInternship = (internshipId) => {
    if (user) {
      dispatch(toggleSaveInternship(internshipId));
    }
  };

  return (
    <>
      <Helmet>
        <title>Browse Internships - InternQuest</title>
        <meta
          name="description"
          content="Browse and search through thousands of internship opportunities from top companies."
        />
      </Helmet>

      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Find Your Perfect Internship
            </h1>
            <p className="text-gray-400">
              {pagination.total} opportunities available
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="search-bar">
                <Search className="w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search internships..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-500"
                />
              </div>
            </form>

            <button
              onClick={() => setIncludeExternal(!includeExternal)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                includeExternal
                  ? "bg-secondary-500 text-white"
                  : "bg-dark-700 text-gray-300 border border-dark-500 hover:bg-dark-600"
              }`}
            >
              <Globe className="w-4 h-4" />
              {includeExternal ? "External ON" : "Include External"}
            </button>

            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-dark-700 text-gray-300 border border-dark-500 hover:bg-dark-600 transition-all"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Active Filters */}
          {Object.entries(filters).some(
            ([key, value]) => value && key !== "page" && key !== "limit",
          ) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.entries(filters).map(([key, value]) => {
                if (!value || key === "page" || key === "limit") return null;
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-dark-600 border border-dark-500 rounded-full text-sm text-gray-300"
                  >
                    {key}: {value.toString()}
                    <button
                      onClick={() =>
                        handleFilterChange(key, key === "remote" ? false : "")
                      }
                      className="ml-1 text-gray-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
              <button
                onClick={clearFilters}
                className="text-primary-400 hover:text-primary-300 text-sm font-medium"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <ListSkeleton count={6} CardComponent={InternshipCardSkeleton} />
          ) : internships.length === 0 ? (
            filters.search ? (
              <EmptySearchResults
                query={filters.search}
                onClear={clearFilters}
              />
            ) : (
              <EmptyInternships />
            )
          ) : (
            <>
              {/* Internship Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {internships.map((internship) => (
                  <div
                    key={internship._id || internship.id}
                    className="dark-card dark-card-hover group relative"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors line-clamp-2 mb-1">
                          {internship.title}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Building2 className="w-4 h-4" />
                          <span>
                            {internship.companyName ||
                              internship.company?.name ||
                              internship.company}
                          </span>
                          {internship.company?.companyProfile?.verified && (
                            <span className="badge badge-primary text-xs">
                              Verified
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1">
                        {user && user.role === "student" && (
                          <WishlistButton
                            internship={internship}
                            size="small"
                          />
                        )}
                        {internship.featured && (
                          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {internship.location?.type === "remote"
                            ? "Remote"
                            : `${internship.location?.city || ""}, ${internship.location?.state || ""}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{internship.duration}</span>
                      </div>
                      {internship.stipend?.amount > 0 && (
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            {internship.stipend.currency === "INR" ? "₹" : "$"}
                            {internship.stipend.amount}/
                            {internship.stipend.period}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                      {internship.description
                        ? internship.description.substring(0, 100) + "..."
                        : "No description available"}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {internship.isExternal && (
                        <span className="badge badge-primary">
                          <Globe className="w-3 h-3 mr-1" />
                          {internship.source}
                        </span>
                      )}
                      <span className="badge badge-gray">
                        {internship.category || "Other"}
                      </span>
                      <span className="badge badge-gray">
                        {internship.type}
                      </span>
                      {internship.urgent && (
                        <span className="badge badge-error">Urgent</span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-dark-500">
                      <span className="text-xs text-gray-500">
                        {internship.applicationDeadline
                          ? `Deadline: ${format(new Date(internship.applicationDeadline), "MMM dd, yyyy")}`
                          : `Posted: ${internship.postedDate ? format(new Date(internship.postedDate), "MMM dd, yyyy") : "Recently"}`}
                      </span>
                      {internship.isExternal ? (
                        <a
                          href={internship.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-4 py-2 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Apply
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <Link
                          to={`/internships/${internship._id}`}
                          className="flex items-center gap-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          View
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`px-3 py-2 rounded-lg font-medium transition-all ${
                      pagination.page === 1
                        ? "bg-dark-800 text-gray-600 cursor-not-allowed"
                        : "bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white"
                    }`}
                  >
                    ← Prev
                  </button>

                  {/* Page Numbers with ellipsis */}
                  {(() => {
                    const currentPage = pagination.page;
                    const totalPages = pagination.pages;
                    const pages = [];

                    // Always show first page
                    pages.push(1);

                    // Calculate range around current page
                    let startPage = Math.max(2, currentPage - 1);
                    let endPage = Math.min(totalPages - 1, currentPage + 1);

                    // Add ellipsis after first page if needed
                    if (startPage > 2) {
                      pages.push("...");
                    }

                    // Add pages around current
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(i);
                    }

                    // Add ellipsis before last page if needed
                    if (endPage < totalPages - 1) {
                      pages.push("...");
                    }

                    // Always show last page if more than 1 page
                    if (totalPages > 1) {
                      pages.push(totalPages);
                    }

                    return pages.map((page, index) =>
                      page === "..." ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-2 text-gray-500"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all ${
                            pagination.page === page
                              ? "bg-primary-500 text-white"
                              : "bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    );
                  })()}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className={`px-3 py-2 rounded-lg font-medium transition-all ${
                      pagination.page === pagination.pages
                        ? "bg-dark-800 text-gray-600 cursor-not-allowed"
                        : "bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white"
                    }`}
                  >
                    Next →
                  </button>
                </div>
              )}

              {/* No Results */}
              {internships.length === 0 && !isLoading && (
                <div className="text-center py-16">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No internships found
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Try adjusting your search criteria or filters
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </>
          )}

          {/* Filter Drawer */}
          {filtersOpen && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setFiltersOpen(false)}
              />
              <div className="relative w-80 bg-dark-800 border-l border-dark-600 h-full overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Filters</h2>
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={localFilters.category}
                      onChange={(e) =>
                        handleFilterChange("category", e.target.value)
                      }
                      className="input-dark"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={localFilters.location}
                      onChange={(e) =>
                        handleFilterChange("location", e.target.value)
                      }
                      placeholder="City, State, or Country"
                      className="input-dark"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Type
                    </label>
                    <select
                      value={localFilters.type}
                      onChange={(e) =>
                        handleFilterChange("type", e.target.value)
                      }
                      className="input-dark"
                    >
                      <option value="">All Types</option>
                      <option value="internship">Internship</option>
                      <option value="project">Project</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                    </select>
                  </div>

                  {/* Work Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Work Mode
                    </label>
                    <select
                      value={localFilters.remote ? "remote" : ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "remote",
                          e.target.value === "remote",
                        )
                      }
                      className="input-dark"
                    >
                      <option value="">All Modes</option>
                      <option value="remote">Remote</option>
                      <option value="onsite">On-site</option>
                    </select>
                  </div>

                  {/* Stipend Range */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Min Stipend
                      </label>
                      <input
                        type="number"
                        value={localFilters.stipendMin}
                        onChange={(e) =>
                          handleFilterChange("stipendMin", e.target.value)
                        }
                        className="input-dark"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max Stipend
                      </label>
                      <input
                        type="number"
                        value={localFilters.stipendMax}
                        onChange={(e) =>
                          handleFilterChange("stipendMax", e.target.value)
                        }
                        className="input-dark"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={applyFilters}
                      className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
                    >
                      Apply Filters
                    </button>
                    <button
                      onClick={clearFilters}
                      className="flex-1 py-3 bg-dark-600 hover:bg-dark-500 text-white rounded-xl font-medium transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InternshipList;
