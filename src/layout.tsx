import {PropsWithChildren} from 'hono/dist/types/jsx'

const NavbarLink = (props: { active: boolean, url: string, label: string }) => {
    return (
        <li className="nav-item">
            <a className={`nav-link${props.active ? ' active' : ''}`} href={props.url}>{props.label}</a>
        </li>
    )
}

type ActiveLink = 'HOME' | 'PANEL' | 'ACCOUNT' | 'LOGIN'

const Layout = (props: PropsWithChildren<{ title: string, loggedIn: boolean, active?: ActiveLink }>) => {
    return (
        <html>
        <head>
            <meta charset="UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>{props.title}</title>
            <link rel="stylesheet" href="/css/bootstrap.min.css"/>
        </head>
        <body>
        <nav class="navbar navbar-expand bg-body-tertiary">
            <div class="container-fluid">
                <span class="navbar-brand mb-0 h1">Untis to Calender</span>
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <NavbarLink active={props.active === 'HOME'} url="/" label="Home" />
                    {props.loggedIn ? (
                        <>
                            <NavbarLink active={props.active === 'PANEL'} url="/panel" label="Panel" />
                            <NavbarLink active={props.active === 'ACCOUNT'} url="/account" label="Account" />
                            <NavbarLink active={false} url="/logout" label="Logout" />
                        </>
                    ) : (
                        <NavbarLink active={props.active === 'LOGIN'} url="/login" label="Login" />
                    )}
                </ul>
            </div>
        </nav>
        <div class="container mt-4">
            {props.children}
        </div>
        </body>
        </html>
    )
}

export default Layout