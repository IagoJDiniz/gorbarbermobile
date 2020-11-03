import React, { createContext, useCallback,useEffect, useContext, useState } from 'react'
import api from '../services/api'
import AsyncStorage from '@react-native-community/async-storage'

interface SignInCredentials {
  email: string
  password: string
}

interface AuthState {
  token: string
  user: object
}

interface AuthContextData {
  user: object
  loading:boolean
  signIn(credentials: SignInCredentials): Promise<void>
  signOut(): void
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState>({} as AuthState)
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    async function loadStoragedData():Promise<void>{
        const token = await AsyncStorage.getItem('@Gobarber:token')
        const user = await AsyncStorage.getItem('@Gobarber:user')

        if(token && user){
          setData({token,user:JSON.parse(user)})
        }
        setLoading(false)
    }
    
    loadStoragedData()


  },[])


  const signIn = useCallback(async ({ email, password }) => {
    const response = await api.post('sessions', {
      email,
      password,
    })

    const { token, user } = response.data

    console.log(response.data)

    await AsyncStorage.setItem('@Gobarber:token', token)
    await AsyncStorage.setItem('@Gobarber:user', JSON.stringify(user))



    setData({ token, user })
  }, [])


  const signOut = useCallback(async () => {
    await AsyncStorage.multiRemove(['@Gobarber:token','@Gobarber:user'])
    setData({} as AuthState)
  }, [])

  return (
    <AuthContext.Provider value={{ user: data?.user, loading, signIn, signOut }}>
      {children}

    </AuthContext.Provider>
  )
}


export function useAuth(): AuthContextData {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

