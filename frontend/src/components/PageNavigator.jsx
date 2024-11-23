const NAVIGATE_FIRST = 'first'
const NAVIGATE_PREVIOUS = 'previous'
const NAVIGATE_NEXT = 'next'
const NAVIGATE_LAST = 'last'

import '../scss/page-navigator.scss'

const PageNavigator = ({list = null, onPageNavigate = null}) => {
    const currentPage = list.page
    const pageCount = parseInt(list.count / list.limit +1)

    const callPageNavigate = (action) => {
        if (typeof(onPageNavigate) !== 'function') {
            console.error('Callback pageNavigate is not defined')
            return
        }
        let page = currentPage
        switch (action) {
            case NAVIGATE_FIRST:
                page = 1
                break
            case NAVIGATE_PREVIOUS:
                page--
                break
            case NAVIGATE_NEXT:
                page++
                break
            case NAVIGATE_LAST:
                page = pageCount
                break
        }
        if (page < 1)
            page = 1
        if (page > pageCount)
            page = pageCount
        onPageNavigate({action, page})
    }

    const onFirstPageButtonClick = () => {
        callPageNavigate(NAVIGATE_FIRST)
    }
    const onPreviousPageButtonClick = () => {
        callPageNavigate(NAVIGATE_PREVIOUS)
    }
    const onNextPageButtonClick = () => {
        callPageNavigate(NAVIGATE_NEXT)
    }
    const onLastPageButtonClick = () => {
        callPageNavigate(NAVIGATE_LAST)
    }

    return (<div className='page-navigator'>
            <button onClick={onFirstPageButtonClick}>&lt;&lt;</button>
            <button onClick={onPreviousPageButtonClick}>&lt;</button>
            <span>Page {currentPage} / {pageCount} </span>
            <button onClick={onNextPageButtonClick}>&gt;</button>
            <button onClick={onLastPageButtonClick}>&gt;&gt;</button>
        </div>
    )
}

export default PageNavigator
