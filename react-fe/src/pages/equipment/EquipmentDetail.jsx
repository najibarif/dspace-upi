import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
    FiArrowLeft,
    FiExternalLink,
    FiCalendar,
    FiMapPin,
    FiUsers,
    FiTag,
} from "react-icons/fi";

// Cache untuk API response
const apiCache = new Map();

// Fetch API dengan retry
const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 300) => {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                Accept: "application/json",
                ...options.headers,
            },
        });

        if (!response.ok) {
            if (response.status === 429 && retries > 0) {
                const retryAfter = response.headers.get("Retry-After") || backoff;
                const waitTime = parseInt(retryAfter, 10) * 1000 || backoff * 1000;
                await new Promise((r) => setTimeout(r, waitTime));
                return fetchWithRetry(
                    url,
                    options,
                    retries - 1,
                    Math.min(backoff * 2, 60000)
                );
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        apiCache.set(cacheKey, data);
        return data;
    } catch (error) {
        if (retries > 0) {
            const waitTime = backoff * 1000;
            await new Promise((r) => setTimeout(r, waitTime));
            return fetchWithRetry(
                url,
                options,
                retries - 1,
                Math.min(backoff * 2, 60000)
            );
        }
        throw error;
    }
};

const EquipmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [equipment, setEquipment] = useState(location.state?.equipment || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEquipment = async () => {
            if (location.state?.equipment) {
                setEquipment(location.state.equipment);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                if (!id) throw new Error("No equipment ID provided");

                const response = await fetchWithRetry(
                    `https://api.openalex.org/works/${id}`
                );

                const equipmentData = {
                    id: response.id?.split("/").pop() || id,
                    title: response.title || "Untitled Equipment",
                    description: response.abstract || "No description available",
                    type: response.type || "equipment",
                    year: response.publication_year || "N/A",
                    authors:
                        response.authorships
                            ?.map((auth) => auth.author?.display_name)
                            .filter(Boolean)
                            .join(", ") || "Unknown",
                    institution: response.host_venue?.publisher || "Unknown",
                    url: response.doi
                        ? `https://doi.org/${response.doi}`
                        : response.primary_location?.landing_page_url ||
                        response.primary_location?.pdf_url ||
                        "#",
                };

                setEquipment(equipmentData);
                setError(null);
            } catch (err) {
                setError(
                    err.message || "Failed to load equipment details. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchEquipment();
    }, [id, location.state]);

    // Loading skeleton
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="animate-pulse w-full max-w-xl bg-white rounded-2xl shadow p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-24 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-red-50">
                <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!equipment) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-800">
                    Equipment not found
                </h2>
                <button
                    onClick={() => navigate("/equipments")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Back to List
                </button>
            </div>
        );
    }

    // Main detail view
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center md:py-32 py-12 px-4">
            <div className="w-full max-w-2xl">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center mb-6 transition hover:text-[#a31f1f]"
                    style={{ color: '#d52727' }}

                >
                    <FiArrowLeft className="mr-2" /> Back
                </button>

                <div className="bg-white rounded-2xl shadow-md p-8 space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {equipment.title}
                        </h1>
                        <p className="text-sm text-gray-500">
                            Equipment Details Information
                        </p>
                    </div>

                    <div className="space-y-5 border-t border-gray-200 pt-5">
                        <DetailRow icon={<FiTag />} label="Type" value={equipment.type} />
                        <DetailRow
                            icon={<FiUsers />}
                            label="Authors"
                            value={equipment.authors}
                        />
                        <DetailRow
                            icon={<FiMapPin />}
                            label="Institution"
                            value={equipment.institution}
                        />
                        <DetailRow
                            icon={<FiCalendar />}
                            label="Year"
                            value={equipment.year}
                        />
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">
                                Description
                            </h3>
                            <p className="text-gray-800 leading-relaxed text-sm">
                                {equipment.description}
                            </p>
                        </div>

                        {equipment.url && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Source
                                </h3>
                                <a
                                    href={equipment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    Visit source <FiExternalLink className="ml-1 h-4 w-4" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reusable row component
const DetailRow = ({ icon, label, value }) => (
    <div className="flex flex-col">
        <div className="flex items-center text-sm text-gray-500 font-medium">
            {icon && <span className="mr-2 text-gray-400">{icon}</span>}
            {label}
        </div>
        <p className="text-gray-900 text-sm mt-1">{value}</p>
    </div>
);

export default EquipmentDetail;
