import { useEffect, useState } from 'react'

function CategoryList({ endpoint = 'http://localhost:5000/api/products/categories/details' }) {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let mounted = true
        async function load() {
            try {
                const res = await fetch(endpoint)
                if (!res.ok) throw new Error('Failed to load categories')
                const data = await res.json()
                if (!mounted) return
                // Expecting array of { category, imageUrl, count }
                setCategories(Array.isArray(data) ? data : [])
            } catch (err) {
                if (!mounted) return
                setError(err.message || 'Failed to load')
            } finally {
                if (mounted) setLoading(false)
            }
        }
        load()
        return () => { mounted = false }
    }, [endpoint])

    if (loading) return <div className="my-6">Loading categories...</div>
    if (error) return <div className="my-6 text-red-600">{error}</div>

    return (
        <div className="my-8">
            
            <div className="overflow-x-auto">
                <div className="flex gap-8 items-start px-2 py-4">
                    {categories.map((cat, i) => {
                        const name = cat.category || cat.name || 'Category'
                        const img = cat.imageUrl || cat.image || ''
                        const count = cat.count || 0
                        return (
                            <div key={`${name}-${i}`} className="flex-shrink-0 w-40 text-center">
                                <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto overflow-hidden"> 
                                    {/* bg-green-50 */}
                                    {img ? (
                                        <img src={img} alt={name} className="w-16 h-16 object-contain" />
                                    ) : (
                                        <div className="w-12 h-12 bg-white rounded-full" />
                                    )}
                                </div>
                                <h4 className="mt-3 text-sm font-semibold text-gray-800">{name}</h4>
                                <p className="mt-1 text-xs text-gray-500">{count ? `${count} Products` : '125+ Products'}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default CategoryList
