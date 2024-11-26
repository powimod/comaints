import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import AdminUserEditor from '../components/AdminUserEditor';
import PageNavigator from '../components/PageNavigator';
import useUserActions from '../actions/userActions';
import { useComaintContext } from '../ComaintContext';

import '../scss/list-page.scss';

const UserPage = () => {
    let { id } = useParams();
    if (id === undefined) // no user ID specified in URL path
        id = null;
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { comaintContext } = useComaintContext();
    const { updateUserList, selectedUser, userList, getUserById } = useUserActions();
    const [ error, setError ] = useState(null);
    const [ activeElement, setActiveElement ] = useState('list');
    const componentInitializedRef = useRef(false);


    useEffect(() => {
        if (comaintContext === null || comaintContext.connected === false)
            navigate('/');
    }, [comaintContext]);

    useEffect(() => {
        // detect react strict mode
        if ( componentInitializedRef.current  === true)
            return;
        componentInitializedRef.current = true;
        refreshUserList();
    }, []);

    const refreshUserList = async (page = 1) => {
        try {
            await updateUserList(page);
        }
        catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {
        const getUser = async () => {
            try {
                await getUserById(id);
            }
            catch (error) {
                setError(error.message);
            }
        };
        if (id === null) // no user ID specified in URL
            return;
        if (selectedUser === null || selectedUser.id != id)
            getUser();
    }, [id]);


    useEffect( () => {
        // enlever l'ID de l'URL après une suppression
        if (selectedUser === null && id !== null)
            navigate('/admin/users');

    }, [selectedUser ]);

    useEffect( () => {
        const elElementList = document.getElementById('element-list');
        const elElementEditor = document.getElementById('element-editor');
        if ( elElementList === null || elElementEditor  === null)
            return;
        switch (activeElement) {
            case 'editor':
                elElementList.classList.add('inactive-element');
                elElementEditor.classList.remove('inactive-element');
                break;
            case 'list':
                elElementList.classList.remove('inactive-element');
                elElementEditor.classList.add('inactive-element');
                break;
            default:
                console.error('Invalid active element', activeElement);
        }
    }, [activeElement]);


    const onPageNavigate = (action) => {
        refreshUserList(action.page);
    };

    const onUserLinkClick = () => {
        setActiveElement('editor');
    };

    const onEditorClose = () => {
        setActiveElement(() => 'list');
    };

    if ( userList === null || userList === undefined || userList.list === null)
        return <></>;

    return (<main className='list-page'>
                <div id='element-list' className='list-container'>
                    <h1>{t('page-title.user')} (x{userList.count})</h1>
                    <div>
                        { error !== null && <div className='error-message'>{error}</div>}
                        {  userList.list === undefined || userList.list.length === 0 ?
                            <div>{t('list-is-empty')}</div>
                            :
                            <>
                                <ul>
                                { userList.list.map (user =>
                                        <li key={user.id}>
                                            <Link to={`/admin/users/${user.id}`} onClick={onUserLinkClick}>
                                                {user.email}
                                            </Link>
                                        </li>
                                    )
                                }
                                </ul>
                                <PageNavigator list={userList} onPageNavigate={onPageNavigate}/>
                            </>
                        }
                    </div>
                </div>
                <div id='element-editor'>
                    <AdminUserEditor onClose={onEditorClose}/>
                </div>
            </main>);
};


export default UserPage;
